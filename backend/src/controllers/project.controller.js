import Project from "../models/project.model.js";
import User from "../models/user.model.js";

// Tüm projeleri getir (genel projeler sayfası için)
export const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tags, search } = req.query;
    
    // Filtre objesi oluştur
    const filter = { isActive: true, visibility: 'public' };
    
    if (status) filter.status = status;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage')
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
    console.error("Get all projects error:", error);
    res.status(500).json({ message: "Projeler getirilemedi", error: error.message });
  }
};

// Kullanıcının projelerini getir (kendi projeleri)
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Kullanıcının sahip olduğu veya üyesi olduğu projeler
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
    console.error("Get user projects error:", error);
    res.status(500).json({ message: "Kullanıcı projeleri getirilemedi", error: error.message });
  }
};

// Tek proje detayı getir
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findOne({ _id: id, isActive: true })
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error("Get project by ID error:", error);
    res.status(500).json({ message: "Proje getirilemedi", error: error.message });
  }
};

// Yeni proje oluştur
export const createProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description, tags, requiredSkills, maxMembers, deadline, visibility } = req.body;

    // Validasyon
    if (!title || !description || !tags || tags.length === 0) {
      return res.status(400).json({ 
        message: "Başlık, açıklama ve en az bir etiket gereklidir" 
      });
    }

    const newProject = new Project({
      title,
      description,
      tags,
      requiredSkills: requiredSkills || [],
      maxMembers: maxMembers || 5,
      deadline: deadline ? new Date(deadline) : null,
      visibility: visibility || 'public',
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });

    const savedProject = await newProject.save();
    
    // Populate edilmiş proje döndür
    const populatedProject = await Project.findById(savedProject._id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(201).json({ 
      message: "Proje başarıyla oluşturuldu",
      project: populatedProject 
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Proje oluşturulamadı", error: error.message });
  }
};

// Proje güncelle (sadece owner)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

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

    res.status(200).json({ 
      message: "Proje başarıyla güncellendi",
      project: updatedProject 
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Proje güncellenemedi", error: error.message });
  }
};

// Proje sil (sadece owner)
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

    // Soft delete
    await Project.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({ message: "Proje başarıyla silindi" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Proje silinemedi", error: error.message });
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

    // Zaten üye mi kontrol et
    const isAlreadyMember = project.members.some(
      member => member.user.toString() === userId.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "Zaten bu projenin üyesisiniz" });
    }

    // Maksimum üye kontrolü
    if (project.members.length >= project.maxMembers) {
      return res.status(400).json({ message: "Proje maksimum üye kapasitesine ulaştı" });
    }

    // Üye olarak ekle
    project.members.push({ user: userId, role: 'member' });
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(200).json({ 
      message: "Projeye başarıyla katıldınız",
      project: updatedProject 
    });
  } catch (error) {
    console.error("Join project error:", error);
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

    // Owner projeyi terk edemez
    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: "Proje sahibi projeyi terk edemez" });
    }

    // Üye mi kontrol et
    const memberIndex = project.members.findIndex(
      member => member.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: "Bu projenin üyesi değilsiniz" });
    }

    // Üyeyi çıkar
    project.members.splice(memberIndex, 1);
    await project.save();

    res.status(200).json({ message: "Projeden başarıyla ayrıldınız" });
  } catch (error) {
    console.error("Leave project error:", error);
    res.status(500).json({ message: "Projeden ayrılamadı", error: error.message });
  }
};
