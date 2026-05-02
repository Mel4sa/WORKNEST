import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

// Tüm projeleri getir (genel projeler sayfası için)
export const getAllProjects = async (req, res) => {
  try {
  const { page = 1, limit = 10, status, skills, search } = req.query;
    
    const filter = { isActive: true, visibility: 'public' };
    
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }
  if (skills) filter.skills = { $in: skills.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('owner', 'fullname email profileImage title department university')
      .populate('members.user', 'fullname email profileImage title department university bio skills')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

    res.status(200).json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Projeler getirilemedi", error: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      isActive: true
    })
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Kullanıcı projeleri getirilemedi", error: error.message });
  }
};

// Sadece kendi projeleri getir
export const getOwnedProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const projects = await Project.find({
      owner: userId,
      isActive: true,
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('owner', 'fullname email profileImage')
      .select('title description status owner')
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Kendi projeleri getirilemedi", error: error.message });
  }
};

// Tek proje detayı getir
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findOne({ _id: id, isActive: true })
      .populate('owner', 'fullname email profileImage title department university')
      .populate('members.user', 'fullname email profileImage title department university bio skills');

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Proje getirilemedi", error: error.message });
  }
};

// Yeni proje oluştur
export const createProject = async (req, res) => {
  try {
    const userId = req.user._id;
  const { title, description, skills, deadline, visibility, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        message: "Başlık ve açıklama gereklidir" 
      });
    }

    if (!skills || skills.length === 0) {
      return res.status(400).json({ 
        message: "En az bir beceri seçmelisiniz" 
      });
    }

    const newProject = new Project({
      title,
      description,
      skills,
      deadline: deadline ? new Date(deadline) : null,
      visibility: visibility || 'public',
      status: status || 'planned',
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });
    
    const savedProject = await newProject.save();
    
    await User.findByIdAndUpdate(
      userId,
      { $push: { projects: savedProject._id } },
      { new: true }
    );
    
    const populatedProject = await Project.findById(savedProject._id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(201).json({ 
      message: "Proje başarıyla oluşturuldu",
      project: populatedProject 
    });
  } catch (error) {
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation hatası", 
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Bu proje adı zaten kullanılıyor" 
      });
    }
    
    res.status(500).json({ message: "Proje oluşturulamadı", error: error.message });
  }
};


export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    if (updateData.tags) {
      updateData.skills = updateData.tags;
      delete updateData.tags;
    }
    if (updateData.requiredSkills) {
      delete updateData.requiredSkills;
    }

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu projeyi güncelleme yetkiniz yok" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    if (updatedProject.members && updatedProject.members.length > 0) {
      try {
        const memberUserIds = updatedProject.members
          .map(member => member.user._id)
          .filter(memberId => memberId.toString() !== userId.toString());

        for (const memberId of memberUserIds) {
          await createNotification({
            userId: memberId,
            type: 'project_update',
            title: 'Proje Güncellendi',
            message: `"${updatedProject.title}" projesi güncellendi`,
            relatedProject: updatedProject._id,
            relatedUser: userId
          });
        }
      } catch (notificationError) {
        console.error("Üye bildirimeri gönderilemedi:", notificationError);
      }
    }

    res.status(200).json({ 
      message: "Proje başarıyla güncellendi",
      project: updatedProject 
    });
  } catch (error) {
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation hatası", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: "Proje güncellenemedi", error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu projeyi silme yetkiniz yok" });
    }

    await Project.findByIdAndDelete(id);

    await User.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );

    res.status(200).json({ message: "Proje başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Proje silinemedi", error: error.message });
  }
};

export const cleanupDeletedProjects = async (req, res) => {
  try {
    const deletedProjects = await Project.deleteMany({ isActive: false });
    
    const allUsers = await User.find({});
    for (const user of allUsers) {
      const validProjects = [];
      for (const projectId of user.projects) {
        const project = await Project.findById(projectId);
        if (project && project.isActive) {
          validProjects.push(projectId);
        }
      }
      user.projects = validProjects;
      await user.save();
    }
    
    res.status(200).json({ 
      message: "Database temizlendi",
      deletedCount: deletedProjects.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Temizleme hatası", error: error.message });
  }
};

// Projeye katıl
export const joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    const isAlreadyMember = project.members.some(
      member => member.user.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "Zaten bu projenin üyesisiniz" });
    }

    project.members.push({ user: userId, role: 'member' });
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    if (updatedProject && updatedProject.owner && updatedProject.owner._id.toString() !== userId.toString()) {
      const joiningUser = updatedProject.members.find(m => m.user._id.toString() === userId.toString());
      const joiningUserName = joiningUser?.user?.fullname || "Bir kullanıcı";
      await createNotification({
        userId: updatedProject.owner._id,
        type: "member_joined",
        title: "Projeye Yeni Üye Katıldı",
        message: `${joiningUserName}, '${updatedProject.title}' projenize katıldı!`,
        relatedProject: updatedProject._id,
        relatedUser: userId
      });
    }

    res.status(200).json({ 
      message: "Projeye başarıyla katıldınız",
      project: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ message: "Projeye katılamadı", error: error.message });
  }
};

// Projeden ayrıl
export const leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: "Proje sahibi projeyi terk edemez" });
    }

    const memberIndex = project.members.findIndex(
      member => member.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: "Bu projenin üyesi değilsiniz" });
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    res.status(200).json({ message: "Projeden başarıyla ayrıldınız" });
  } catch (error) {
    res.status(500).json({ message: "Projeden ayrılamadı", error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {

    const { id, userId } = req.params;
    const { reason } = req.body;
    const requesterId = req.user._id;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: "Bu işlemi yapma yetkiniz yok" });
    }

    if (userId === requesterId.toString()) {
      return res.status(400).json({ message: "Proje sahibi kendisini çıkaramaz" });
    }

    const memberIndex = project.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: "Bu kullanıcı projenin üyesi değil" });
    }
    const removedMember = project.members[memberIndex];
    project.members.splice(memberIndex, 1);

    await project.save();

    try {
      const notification = await createNotification({
        userId: userId,
        type: 'member_left',
        title: 'Projeden Çıkarıldınız',
        message: reason
          ? `"${project.title}" projesinden ${reason} sebebiyle çıkarıldınız. `
          : `"${project.title}" projesinden çıkarıldınız`,
        relatedProject: project._id,
        relatedUser: requesterId
      });
    } catch (notificationError) {
    }

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage title department university')
      .populate('members.user', 'fullname email profileImage title department university bio skills');

    res.status(200).json({ 
      message: "Üye başarıyla çıkarıldı",
      project: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ message: "Üye çıkarılamadı", error: error.message });
  }
};

// Create a new ilan for a project
export const createIlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, skills } = req.body;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "İlan verme yetkiniz yok" });
    }

    // Create new ilan object
    const newIlan = {
      title: title || 'Üye Arıyoruz',
      description: description || '',
      skills: skills || [],
      isActive: true,
      createdAt: new Date()
    };

    // Add to ilans array
    if (!project.ilans) {
      project.ilans = [];
    }
    project.ilans.push(newIlan);
    
    // Also update legacy field for backward compatibility
    project.lookingForMembers = true;
    if (skills && skills.length > 0) {
      project.lookingForSkills = skills;
    }

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(201).json({ 
      message: "İlan başarıyla oluşturuldu",
      project: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ message: "İlan oluşturulamadı", error: error.message });
  }
};

// Update an existing ilan
export const updateIlan = async (req, res) => {
  try {
    const { id, ilanId } = req.params;
    const userId = req.user._id;
    const { title, description, skills, isActive } = req.body;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "İlan güncelleme yetkiniz yok" });
    }

    // Find the ilan
    const ilanIndex = project.ilans.findIndex(
      ilan => ilan._id.toString() === ilanId
    );

    if (ilanIndex === -1) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }

    // Update ilan fields
    if (title !== undefined) project.ilans[ilanIndex].title = title;
    if (description !== undefined) project.ilans[ilanIndex].description = description;
    if (skills !== undefined) project.ilans[ilanIndex].skills = skills;
    if (isActive !== undefined) project.ilans[ilanIndex].isActive = isActive;

    // Check if any active ilans remain
    const hasActiveIlans = project.ilans.some(ilan => ilan.isActive);
    project.lookingForMembers = hasActiveIlans;

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(200).json({ 
      message: "İlan başarıyla güncellendi",
      project: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ message: "İlan güncellenemedi", error: error.message });
  }
};

// Delete/deactivate an ilan
export const deleteIlan = async (req, res) => {
  try {
    const { id, ilanId } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({ _id: id, isActive: true });

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "İlan silme yetkiniz yok" });
    }

    // Find and remove the ilan
    const ilanIndex = project.ilans.findIndex(
      ilan => ilan._id.toString() === ilanId
    );

    if (ilanIndex === -1) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }

    project.ilans.splice(ilanIndex, 1);

    // Check if any active ilans remain
    const hasActiveIlans = project.ilans.some(ilan => ilan.isActive);
    project.lookingForMembers = hasActiveIlans;

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(200).json({ 
      message: "İlan başarıyla silindi",
      project: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ message: "İlan silinemedi", error: error.message });
  }
};

// Get all ilans for a project
export const getProjectIlans = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, isActive: true })
      .select('ilans lookingForMembers lookingForSkills');

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    res.status(200).json({ 
      ilans: project.ilans || [],
      lookingForMembers: project.lookingForMembers,
      lookingForSkills: project.lookingForSkills
    });
  } catch (error) {
    res.status(500).json({ message: "İlanlar getirilemedi", error: error.message });
  }
};
