import Project from "../models/project.model.js";
import User from "../models/user.model.js";

// Tüm projeleri getir (genel projeler sayfası için)
export const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tags, search } = req.query;
    
    // Filtre objesi oluştur
    const filter = { isActive: true, visibility: 'public' };
    
    // Anasayfada tamamlanan ve iptal edilen projeleri gösterme
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }
    if (tags) filter.tags = { $in: tags.split(',') };
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
    res.status(500).json({ message: "Kullanıcı projeleri getirilemedi", error: error.message });
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
    const { title, description, tags, requiredSkills, maxMembers, deadline, visibility, status } = req.body;

    // Validasyon
    if (!title || !description) {
      return res.status(400).json({ 
        message: "Başlık ve açıklama gereklidir" 
      });
    }

    // Tags kontrolü - en az bir teknoloji gerekli
    if (!tags || tags.length === 0) {
      return res.status(400).json({ 
        message: "En az bir teknoloji seçmelisiniz" 
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
      status: status || 'planned',
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });
    
    const savedProject = await newProject.save();
    
    // Kullanıcının projects array'ine de ekle
    await User.findByIdAndUpdate(
      userId,
      { $push: { projects: savedProject._id } },
      { new: true }
    );
    
    // Populate edilmiş proje döndür
    const populatedProject = await Project.findById(savedProject._id)
      .populate('owner', 'fullname email profileImage')
      .populate('members.user', 'fullname email profileImage');

    res.status(201).json({ 
      message: "Proje başarıyla oluşturuldu",
      project: populatedProject 
    });
  } catch (error) {
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation hatası", 
        errors: validationErrors
      });
    }
    
    // Duplicate key error
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
    
    // Mongoose validation errors
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

    // Hard delete - projeyi tamamen sil
    await Project.findByIdAndDelete(id);

    // Tüm kullanıcıların projects array'lerinden kaldır
    await User.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );

    res.status(200).json({ message: "Proje başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Proje silinemedi", error: error.message });
  }
};

// Database temizleme - silinmiş projeleri tamamen kaldır
export const cleanupDeletedProjects = async (req, res) => {
  try {
    // isActive: false olan projeleri tamamen sil
    const deletedProjects = await Project.deleteMany({ isActive: false });
    
    // Tüm kullanıcıların projects array'lerini temizle
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
    res.status(500).json({ message: "Projeden ayrılamadı", error: error.message });
  }
};

// Üye çıkar (sadece owner)
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const requesterId = req.user._id;

    console.log("🗑️  Üye silme isteği:", { 
      projectId: id, 
      userIdToRemove: userId, 
      requesterId: requesterId.toString(),
      params: req.params,
      user: req.user ? req.user._id.toString() : 'No user'
    });

    // Proje var mı kontrol et
    console.log("🔍 Proje aranıyor, ID:", id);
    const project = await Project.findOne({ _id: id, isActive: true });
    console.log("📋 Proje bulundu mu:", project ? "Evet" : "Hayır");
    
    if (project) {
      console.log("👤 Proje sahibi:", project.owner.toString());
      console.log("🔒 İstek yapan:", requesterId.toString());
      console.log("🤝 Sahiplik kontrolü:", project.owner.toString() === requesterId.toString());
    }

    if (!project) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    // Sadece proje sahibi üye çıkarabilir
    if (project.owner.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: "Bu işlemi yapma yetkiniz yok" });
    }

    // Owner kendisini çıkaramaz
    if (userId === requesterId.toString()) {
      return res.status(400).json({ message: "Proje sahibi kendisini çıkaramaz" });
    }

    // Üye var mı kontrol et
    console.log("👥 Mevcut üyeler:", project.members.map(m => ({ 
      id: m.user.toString(), 
      _id: m._id 
    })));
    
    const memberIndex = project.members.findIndex(
      member => member.user.toString() === userId
    );

    console.log("🔍 Aranan üye index:", memberIndex);

    if (memberIndex === -1) {
      console.log("❌ Üye bulunamadı");
      return res.status(400).json({ message: "Bu kullanıcı projenin üyesi değil" });
    }

    // Üyeyi çıkar
    console.log("🗑️  Üye çıkarılıyor:", project.members[memberIndex]);
    project.members.splice(memberIndex, 1);
    await project.save();
    console.log("✅ Üye başarıyla çıkarıldı");

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
