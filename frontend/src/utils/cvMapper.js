const safe = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.label || v.value || v.name || v.school || v.degree || '';
  return String(v);
};

export const mapAICvToPreview = (content) => {
  const basics = content?.basics || {};
  const workArr = content?.work || content?.experience || [];

  return {
    name:  safe(basics.name  || content?.name),
    phone: safe(basics.phone || content?.phone),
    email1: safe(basics.email || content?.email1 || content?.email),
    email2: safe(basics.email2 || content?.email2),
    linkedin: safe(basics.linkedin || content?.linkedin),
    title: safe(basics.title || basics.role || basics.headline || content?.title),
    location: safe(basics.location || basics.address || basics.city || content?.location),
    summary: safe(basics.summary || content?.summary),
    skills: Array.isArray(content?.skills) ? content.skills.map(safe).filter(Boolean) : [],
    education: Array.isArray(content?.education)
      ? content.education
        .map((edu) =>
          typeof edu === 'string'
            ? edu
            : [
              safe(edu.degree),
              safe(edu.institution || edu.school || edu.university),
              safe(edu.date || edu.year || edu.graduationDate || edu.period),
            ]
              .filter(Boolean)
              .join(' - ')
        )
        .filter(Boolean)
      : [],
    experience: Array.isArray(workArr)
      ? workArr.map((job) => ({
        company: safe(job.company),
        period:  safe(job.period || job.duration || job.dates),
        role:    safe(job.role || job.position || job.jobTitle),
        bullets: Array.isArray(job.bullets)
          ? job.bullets.map(safe).filter(Boolean)
          : Array.isArray(job.achievements)
            ? job.achievements.map(safe).filter(Boolean)
            : job.description
              ? [safe(job.description)]
              : [],
      }))
      : [],
    projects: Array.isArray(content?.projects) ? content.projects.map(safe).filter(Boolean) : [],
    certifications: Array.isArray(content?.certifications)
      ? content.certifications.map(safe).filter(Boolean)
      : [],
    references: safe(content?.references) || 'Available upon request',
    avatar: safe(basics.avatar || content?.avatar),
  };
};
