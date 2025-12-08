import api from "../lib/api";

export const projectService = {
  // Get all projects with optional filtering
  getProjects: async (options = {}) => {
    const { isActive, isFeatured, category, page = 1, limit = 12 } = options;

    let query = `?page=${page}&limit=${limit}`;
    if (typeof isActive === 'boolean') {
      query += `&isActive=${isActive}`;
    }
    if (isFeatured) {
      query += `&isFeatured=true`;
    }
    if (category && category !== 'all') {
      query += `&category=${encodeURIComponent(category)}`;
    }

    const response = await api.get(`/projects${query}`);
    return response.data;
  },

  // Get single project by ID or slug
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post("/projects", projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Toggle project status (active/inactive)
  toggleStatus: async (projectId, isActive, updatedBy) => {
    const response = await api.patch(`/projects/${projectId}/status`, {
      isActive,
      updatedBy,
    });
    return response.data;
  },

  // Toggle project featured status
  toggleFeatured: async (projectId, isFeatured, updatedBy) => {
    const response = await api.patch(`/projects/${projectId}/status`, {
      isFeatured,
      updatedBy,
    });
    return response.data;
  },

  // Upload multiple project images
  uploadImages: async (files, folder = 'portfolio-projects') => {
    const formData = new FormData();
    
    // Append all files
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const response = await api.post("/projects/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    const response = await api.delete("/projects/upload", {
      data: { publicId },
    });
    return response.data;
  },

  // Get project categories
  getCategories: () => {
    return [
      'Web Application',
      'Mobile App',
      'Desktop App',
      'API/Backend',
      'E-Commerce',
      'CMS',
      'Dashboard',
      'Landing Page',
      'Portfolio',
      'Other',
    ];
  },

  // Get project types
  getProjectTypes: () => {
    return [
      'Client Project',
      'Personal Project',
      'Open Source',
      'Freelance',
      'Company Project',
    ];
  },

  // Common technologies list
  getTechnologies: () => {
    return [
      'JavaScript', 'TypeScript', 'Python', 'PHP', 'Java', 'C#', 'Go', 'Rust',
      'HTML', 'CSS', 'SCSS', 'Tailwind CSS', 'Bootstrap',
    ];
  },

  // Common frameworks list
  getFrameworks: () => {
    return [
      'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
      'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI',
      'Laravel', 'Spring Boot', '.NET', 'Ruby on Rails',
      'React Native', 'Flutter', 'Electron',
    ];
  },

  // Common databases list
  getDatabases: () => {
    return [
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase',
      'Supabase', 'PlanetScale', 'DynamoDB', 'Cassandra',
    ];
  },

  // Common tools list
  getTools: () => {
    return [
      'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify',
      'GitHub Actions', 'Jenkins', 'Figma', 'Postman', 'Jira', 'Notion',
    ];
  },
};
