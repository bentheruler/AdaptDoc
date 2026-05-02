// client/src/components/document/CVPreview.jsx
import EditableField from '../common/EditableField';

/* ─── Google Fonts loader (called once per new theme render) ─── */
const loadedFonts = new Set();
const loadFont = (url) => {
  if (loadedFonts.has(url)) return;
  loadedFonts.add(url);
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = url;
  document.head.appendChild(link);
};

/* ══════════════════════════════════════════════════
   NORMALISE — safe defaults for every field
══════════════════════════════════════════════════ */
const normalise = (data = {}) => ({
  name:    data.name    || '', title:   data.title   || '',
  location:data.location|| '', email1:  data.email1  || '',
  email2:  data.email2  || '', phone:   data.phone   || '',
  linkedin:data.linkedin|| '', summary: data.summary || '',
  skills: Array.isArray(data.skills) ? data.skills
    : typeof data.skills === 'string' ? data.skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
  education: Array.isArray(data.education) ? data.education
    : typeof data.education === 'string' ? data.education.split(',').map(s=>s.trim()).filter(Boolean) : [],
  experience: Array.isArray(data.experience)
    ? data.experience.map(e=>({ company:e.company||'', role:e.role||'', period:e.period||'', bullets:Array.isArray(e.bullets)?e.bullets:[] }))
    : typeof data.experience === 'string' && data.experience.trim()
      ? [{ company:'', role:data.experience, period:'', bullets:[] }] : [],
  projects:       Array.isArray(data.projects)       ? data.projects       : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  references: data.references || '',
});

/* ══════════════════════════════════════════════════
   SHARED OPS
══════════════════════════════════════════════════ */
const buildOps = (data, onDataChange) => ({
  update:       (f,v)      => onDataChange({...data,[f]:v}),
  updateExp:    (ei,f,v)   => onDataChange({...data,experience:data.experience.map((x,i)=>i===ei?{...x,[f]:v}:x)}),
  updateBullet: (ei,bi,v)  => onDataChange({...data,experience:data.experience.map((x,i)=>{ if(i!==ei)return x; return{...x,bullets:x.bullets.map((b,j)=>j===bi?v:b)}; })}),
  updateSkill:  (idx,v)    => onDataChange({...data,skills:data.skills.map((x,i)=>i===idx?v:x)}),
  addSkill:     ()         => onDataChange({...data,skills:[...data.skills,'New Skill']}),
  removeSkill:  (idx)      => onDataChange({...data,skills:data.skills.filter((_,i)=>i!==idx)}),
  addBullet:    (ei)       => onDataChange({...data,experience:data.experience.map((x,i)=>i===ei?{...x,bullets:[...x.bullets,'New achievement']}:x)}),
  removeBullet: (ei,bi)    => onDataChange({...data,experience:data.experience.map((x,i)=>{ if(i!==ei)return x; return{...x,bullets:x.bullets.filter((_,j)=>j!==bi)}; })}),
  updateListItem:(field,idx,v)=>onDataChange({...data,[field]:data[field].map((x,i)=>i===idx?v:x)}),
  removeListItem:(field,idx)  =>onDataChange({...data,[field]:data[field].filter((_,i)=>i!==idx)}),
  addListItem:   (field,text) =>onDataChange({...data,[field]:[...(data[field]||[]),text]}),
});

/* ══════════════════════════════════════════════════
   DISPATCHER
══════════════════════════════════════════════════ */
const CVPreview = ({ data, onDataChange, theme, fontSize, fontFamily = 'Inter', spacing = 'normal', accentColor, editMode }) => {
  const nd = normalise(data);
  const accent = accentColor || '#1e3a5f';
  const fz = parseInt(fontSize) || 12;
  const ops = buildOps(nd, onDataChange);
  const p = { data:nd, ...ops, accent, fz, editMode };

  const map = {
    Classic:    ClassicCV,   Minimal:    MinimalCV,   Bold:      BoldCV,
    Executive:  ExecutiveCV, Tech:       TechCV,      Creative:  CreativeCV,
    Academic:   AcademicCV,  Corporate:  CorporateCV, Timeline:  TimelineCV,
    Infographic:InfographicCV,Nordic:    NordicCV,    Elegant:   ElegantCV,
    Chicago:    ChicagoCV,   Sunset:     SunsetCV,
  };
  const Comp = map[theme] || ModernCV;

  const lineHeight = spacing === 'compact' ? 1.3 : spacing === 'relaxed' ? 1.8 : 1.5;

  if (fontFamily) {
    const url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    loadFont(url);
  }

  return (
    <div style={{ fontFamily: `"${fontFamily}", sans-serif`, lineHeight }}>
      <Comp {...p} />
    </div>
  );
};
export default CVPreview;

/* ══════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════════════ */

/* Editable list (education / projects / certifications) */
const EList = ({ items, field, editMode, onUpdate, onRemove, onAdd, addLabel='Add', bullet, itemSx={}, inputSx={} }) => {
  if (!editMode && (!items || !items.length)) return null;
  return (
    <div>
      {(items||[]).map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:4}}>
          {bullet && <span style={{flexShrink:0,marginTop:2,...(bullet.sx||{})}}>{bullet.char}</span>}
          {editMode
            ? <><input value={s} onChange={e=>onUpdate(i,e.target.value)}
                style={{flex:1,border:'1px dashed #f59e0b',background:'#fffbeb',borderRadius:3,padding:'1px 5px',fontFamily:'inherit',outline:'none',...inputSx}} />
               <span onClick={()=>onRemove(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:12,flexShrink:0}}>×</span></>
            : <span style={itemSx}>{s}</span>}
        </div>
      ))}
      {editMode && <button onClick={()=>onAdd('New item')} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:4,padding:'1px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginTop:3}}>+ {addLabel}</button>}
    </div>
  );
};

/* Contact row helper */
const ContactLine = ({ icon, value, onChange, editMode, sx={}, inputSx={} }) => {
  if (!editMode && !value) return null;
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:5,...sx}}>
      <span style={{flexShrink:0,opacity:0.7}}>{icon}</span>
      <EditableField value={value||''} onChange={onChange} editMode={editMode}
        style={{wordBreak:'break-all'}} inputStyle={inputSx} />
    </div>
  );
};

/* Experience bullets */
const ExpBullets = ({ exp, idx, accent, fz, editMode, updateExp, updateBullet, addBullet, removeBullet, bulletNode }) => (
  <div>
    <ul style={{margin:0,paddingLeft:0,listStyle:'none'}}>
      {exp.bullets.map((b,j)=>(
        <li key={j} style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:4}}>
          {bulletNode || <span style={{color:accent,fontSize:10,flexShrink:0,marginTop:2}}>▸</span>}
          <EditableField value={b} onChange={v=>updateBullet(idx,j,v)} editMode={editMode} multiline
            style={{fontSize:fz*0.85,color:'#555',flex:1,lineHeight:1.55}} />
          {editMode && <span onClick={()=>removeBullet(idx,j)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:12,flexShrink:0}}>×</span>}
        </li>
      ))}
    </ul>
    {editMode && <button onClick={()=>addBullet(idx)} style={{background:'transparent',border:`1px dashed ${accent}`,color:accent,borderRadius:4,padding:'1px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:4}}>+ bullet</button>}
  </div>
);

/* ══════════════════════════════════════════════════
   1. MODERN
══════════════════════════════════════════════════ */
function ModernCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  const eb=editMode?'1px dashed #f59e0b40':'none';
  const Head=({label})=>(
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,marginTop:12}}>
      <div style={{width:3,height:14,background:accent,borderRadius:2}}/>
      <span style={{fontSize:fz*0.72,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:accent}}>{label}</span>
    </div>
  );
  return (
    <div style={{fontSize:fz,display:'flex',flex: 1, minHeight: '100%',background:'#fff'}}>
      <div style={{width:'34%',background:accent,color:'#fff',padding:'28px 18px',display:'flex',flexDirection:'column',gap:16}}>
        <div style={{borderBottom:'2px solid rgba(255,255,255,0.3)',paddingBottom:14}}>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.6,fontWeight:800,color:'#fff',lineHeight:1.2}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.5)'}} />
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'rgba(255,255,255,0.85)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:5,display:'block'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)'}} />
        </div>
        <div>
          <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:6}}>Contact</div>
          {[['📍',data.location,v=>update('location',v)],['📞',data.phone,v=>update('phone',v)],['✉',data.email1,v=>update('email1',v)],['🔗',data.linkedin,v=>update('linkedin',v)]].map(([icon,val,fn],i)=>(
            <ContactLine key={i} icon={icon} value={val} onChange={fn} editMode={editMode} sx={{fontSize:fz*0.79,marginBottom:4}} inputSx={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)',fontSize:fz*0.79}} />
          ))}
        </div>
        {(editMode||data.skills.length>0)&&<div>
          <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:6}}>Skills</div>
          {data.skills.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
              <div style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,0.5)',flexShrink:0}}/>
              {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',borderRadius:3,padding:'1px 5px',color:'#fff',fontSize:fz*0.82,fontFamily:'inherit',outline:'none',flex:1}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'rgba(255,100,100,0.9)',fontWeight:700,fontSize:11}}>×</span></>:<span style={{fontSize:fz*0.82,color:'rgba(255,255,255,0.9)'}}>{s}</span>}
            </div>
          ))}
          {editMode&&<button onClick={addSkill} style={{background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',borderRadius:4,padding:'2px 8px',color:'#fff',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:3}}>+ Add Skill</button>}
        </div>}
        {(editMode||data.education.length>0)&&<div>
          <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:6}}>Education</div>
          <EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'·',sx:{color:'rgba(255,255,255,0.5)'}}} itemSx={{fontSize:fz*0.79,color:'rgba(255,255,255,0.9)',lineHeight:1.4}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)',color:'#fff',fontSize:fz*0.79}} />
        </div>}
        {(editMode||data.certifications.length>0)&&<div>
          <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:6}}>Certifications</div>
          <EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'▸',sx:{color:'rgba(255,255,255,0.45)',fontSize:9}}} itemSx={{fontSize:fz*0.79,color:'rgba(255,255,255,0.85)'}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)',color:'#fff',fontSize:fz*0.79}} />
        </div>}
        {(editMode||data.references)&&<div>
          <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.55)',marginBottom:4}}>References</div>
          <EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.79,color:'rgba(255,255,255,0.85)',fontStyle:'italic'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)'}} />
        </div>}
      </div>
      <div style={{flex:1,padding:'28px 22px',display:'flex',flexDirection:'column'}}>
        {(editMode||data.summary)&&<><Head label="Summary"/><div style={{border:eb,borderRadius:4,marginBottom:4}}><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#444',lineHeight:1.6}} /></div></>}
        {(editMode||data.experience.length>0)&&<><Head label="Experience"/>
          {data.experience.map((exp,i)=>(
            <div key={i} style={{marginBottom:12,paddingLeft:10,borderLeft:`2px solid ${accent}25`,border:eb}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',flexWrap:'wrap',gap:4}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz,color:'#1a1a2e'}} />
                <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.78,color:'#999'}} />
              </div>
              <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.85,color:accent,fontWeight:600,marginBottom:5,display:'block'}} />
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} />
            </div>
          ))}
        </>}
        {(editMode||data.projects.length>0)&&<><Head label="Projects"/>
          <EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'▸',sx:{color:accent,fontSize:10}}} itemSx={{fontSize:fz*0.85,color:'#555',lineHeight:1.5}} />
        </>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   2. CLASSIC
══════════════════════════════════════════════════ */
function ClassicCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  const eb=editMode?'1px dashed #f59e0b40':'none';
  const CS=({label,children})=>(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:fz,fontWeight:400,fontVariant:'small-caps',letterSpacing:'2px',color:accent,borderBottom:`1px solid ${accent}50`,paddingBottom:3,marginBottom:8}}>{label}</div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fffef9',padding:'36px 40px',flex: 1, minHeight: '100%',color:'#1a1a1a'}}>
      <div style={{textAlign:'center',borderBottom:`1.5px solid ${accent}`,paddingBottom:14,marginBottom:20}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.1,fontWeight:400,color:'#1a1a1a',letterSpacing:'2px',fontVariant:'small-caps',display:'block',textAlign:'center'}} />
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.95,color:'#666',fontStyle:'italic',marginTop:4,display:'block',textAlign:'center'}} />
        <div style={{marginTop:8,fontSize:fz*0.8,color:'#888',display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'4px 10px'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(Boolean).map((v,i)=><span key={i}>{i>0&&<span style={{color:'#ccc',margin:'0 4px'}}>|</span>}{v}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<CS label="Professional Summary"><div style={{border:eb}}><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.92,color:'#333',lineHeight:1.7,fontStyle:'italic'}} /></div></CS>}
      {(editMode||data.skills.length>0)&&<CS label="Core Competencies"><div style={{display:'flex',flexWrap:'wrap',gap:4,border:eb,padding:editMode?4:0,borderRadius:4}}>
        {data.skills.map((s,i)=>(<span key={i} style={{fontSize:fz*0.88,color:'#444'}}>{editMode?<span style={{display:'inline-flex',alignItems:'center',gap:3}}><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',color:'#444',fontSize:fz*0.88,fontFamily:'inherit',outline:'none',width:Math.max(50,s.length*7)}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700}}>×</span></span>:s}{!editMode&&i<data.skills.length-1&&<span style={{color:'#bbb',margin:'0 6px'}}>✦</span>}</span>))}
        {editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginLeft:6}}>+ Add</button>}
      </div></CS>}
      {(editMode||data.education.length>0)&&<CS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'✦',sx:{color:accent,fontSize:9,marginTop:3}}} itemSx={{fontSize:fz*0.9,color:'#333'}} /></CS>}
      {(editMode||data.experience.length>0)&&<CS label="Professional Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{marginBottom:14,border:eb,padding:editMode?6:0,borderRadius:4}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz,color:'#1a1a1a'}} />
              <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.8,color:'#888',fontStyle:'italic'}} />
            </div>
            <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.88,color:accent,fontStyle:'italic',marginBottom:5,display:'block'}} />
            <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} />
          </div>
        ))}
      </CS>}
      {(editMode||data.projects.length>0)&&<CS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'✦',sx:{color:accent,fontSize:9,marginTop:3}}} itemSx={{fontSize:fz*0.88,color:'#444'}} /></CS>}
      {(editMode||data.certifications.length>0)&&<CS label="Certifications"><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{data.certifications.map((c,i)=>(<span key={i} style={{fontSize:fz*0.85,color:'#444'}}>{c}{i<data.certifications.length-1&&<span style={{color:'#bbb',margin:'0 6px'}}>·</span>}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b'}}>+ Add</button>}</div></CS>}
      {(editMode||data.references)&&<CS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.9,color:'#555',fontStyle:'italic'}} /></CS>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   3. MINIMAL
══════════════════════════════════════════════════ */
function MinimalCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  const eb=editMode?'1px dashed #f59e0b40':'none';
  const MS=({label,children})=>(
    <div style={{marginBottom:26}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <span style={{fontSize:fz*0.65,fontWeight:600,letterSpacing:'3px',textTransform:'uppercase',color:'#bbb'}}>{label}</span>
        <div style={{flex:1,height:'0.5px',background:'#e5e7eb'}}/>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fafafa',padding:'44px 48px',flex: 1, minHeight: '100%',color:'#111'}}>
      <div style={{marginBottom:36}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.4,fontWeight:300,color:'#111',letterSpacing:'-1px',lineHeight:1.1,display:'block'}} />
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.88,color:accent,fontWeight:500,marginTop:8,display:'block'}} />
        <div style={{marginTop:10,display:'flex',gap:16,flexWrap:'wrap',fontSize:fz*0.76,color:'#999'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(v=>editMode||v).map((v,i)=><span key={i}>{v||'—'}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<MS label="About"><div style={{border:eb}}><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.9,color:'#444',lineHeight:1.8,fontWeight:300}} /></div></MS>}
      {(editMode||data.skills.length>0)&&<MS label="Skills"><div style={{display:'flex',flexWrap:'wrap',gap:'2px 0',border:eb}}>{data.skills.map((s,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',fontSize:fz*0.85,color:'#555',fontWeight:300}}>{editMode?<span style={{display:'inline-flex',alignItems:'center',gap:3}}><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',color:'#444',fontSize:fz*0.85,fontFamily:'inherit',outline:'none',width:Math.max(50,s.length*7)}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,marginRight:8}}>×</span></span>:<>{s}{i<data.skills.length-1&&<span style={{color:'#ccc',margin:'0 10px'}}>—</span>}</>}</span>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginLeft:6}}>+ Add</button>}</div></MS>}
      {(editMode||data.education.length>0)&&<MS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'—',sx:{color:'#ddd',fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.85,color:'#444',fontWeight:300}} /></MS>}
      {(editMode||data.experience.length>0)&&<MS label="Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{marginBottom:20,border:eb,padding:editMode?6:0,borderRadius:4}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
              <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:500,fontSize:fz*0.95,color:'#111'}} />
              <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#aaa'}} />
            </div>
            <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.82,color:accent,marginBottom:7,display:'block'}} />
            <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:'#ddd',fontSize:fz*0.7,flexShrink:0,marginTop:3}}>—</span>} />
          </div>
        ))}
      </MS>}
      {(editMode||data.projects.length>0)&&<MS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'—',sx:{color:'#ddd',fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.85,color:'#444',fontWeight:300}} /></MS>}
      {(editMode||data.certifications.length>0)&&<MS label="Certifications"><span style={{fontSize:fz*0.85,color:'#555',fontWeight:300}}>{data.certifications.join(' — ')}</span>{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginLeft:8}}>+ Add</button>}</MS>}
      {(editMode||data.references)&&<MS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'#555',fontWeight:300,fontStyle:'italic'}} /></MS>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   4. BOLD
══════════════════════════════════════════════════ */
function BoldCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  const eb=editMode?'1px dashed #f59e0b40':'none';
  const dark='#0f172a';
  const BS=({label,children})=>(
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <div style={{background:dark,color:'#fff',fontSize:fz*0.68,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',padding:'3px 10px',borderRadius:3}}>{label}</div>
        <div style={{flex:1,height:1,background:'#e2e8f0'}}/>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',flex: 1, minHeight: '100%'}}>
      <div style={{background:dark,padding:'26px 32px 20px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:5,background:accent}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
          <div>
            <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.3,fontWeight:800,color:'#fff',textTransform:'uppercase',lineHeight:1,}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)'}} />
            <div style={{marginTop:6,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:24,height:3,background:accent,borderRadius:2}}/>
              <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.88,color:accent,fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase'}} inputStyle={{color:accent,background:'rgba(255,255,255,0.05)',border:'1px dashed rgba(255,255,255,0.3)'}} />
            </div>
          </div>
          <div style={{textAlign:'right',fontSize:fz*0.78,color:'rgba(255,255,255,0.6)',display:'flex',flexDirection:'column',gap:3}}>
            {[data.location,data.phone,data.email1,data.linkedin].filter(v=>editMode||v).map((v,i)=><span key={i}>{v||'—'}</span>)}
          </div>
        </div>
      </div>
      {(editMode||data.skills.length>0)&&<div style={{background:accent,padding:'9px 32px',display:'flex',flexWrap:'wrap',gap:6,alignItems:'center'}}>
        {data.skills.map((s,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:4}}>{editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.4)',borderRadius:3,padding:'1px 6px',color:'#fff',fontSize:fz*0.76,fontFamily:'inherit',outline:'none',fontWeight:600}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'rgba(255,100,100,0.9)',fontWeight:700,fontSize:11}}>×</span></>:<span style={{fontSize:fz*0.76,color:'#fff',fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase'}}>{s}</span>}{!editMode&&i<data.skills.length-1&&<span style={{color:'rgba(255,255,255,0.4)',marginLeft:6}}>·</span>}</span>))}
        {editMode&&<button onClick={addSkill} style={{background:'rgba(255,255,255,0.2)',border:'1px dashed rgba(255,255,255,0.5)',borderRadius:3,padding:'1px 8px',color:'#fff',cursor:'pointer',fontSize:11,fontFamily:'inherit',fontWeight:600,marginLeft:4}}>+ Add</button>}
      </div>}
      <div style={{padding:'22px 32px'}}>
        {(editMode||data.summary)&&<BS label="Summary"><div style={{border:eb}}><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#374151',lineHeight:1.7}} /></div></BS>}
        {(editMode||data.education.length>0)&&<BS label="Education">{data.education.map((e,i)=>(<div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:5,background:'#f8fafc',borderLeft:`4px solid ${accent}`,borderRadius:'0 6px 6px 0',padding:'6px 12px'}}><div style={{width:14,height:14,borderRadius:3,background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}><span style={{color:'#fff',fontSize:8,fontWeight:700}}>✓</span></div>{editMode?<><input value={e} onChange={ev=>updateListItem('education',i,ev.target.value)} style={{flex:1,background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'1px 5px',fontSize:fz*0.86,fontFamily:'inherit',outline:'none',color:'#111'}}/><span onClick={()=>removeListItem('education',i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:12}}>×</span></>:<span style={{fontSize:fz*0.86,color:'#374151'}}>{e}</span>}</div>))}{editMode&&<button onClick={()=>addListItem('education','Degree - Institution - Year')} style={{background:'transparent',border:`1px dashed ${accent}`,color:accent,borderRadius:4,padding:'2px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:4}}>+ Add Education</button>}</BS>}
        {(editMode||data.experience.length>0)&&<BS label="Experience">
          {data.experience.map((exp,i)=>(
            <div key={i} style={{marginBottom:14,border:eb,padding:editMode?6:0,borderRadius:4}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f8fafc',padding:'7px 12px',borderLeft:`4px solid ${accent}`,borderRadius:'0 6px 6px 0',marginBottom:7}}>
                <div>
                  <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz,color:'#111',textTransform:'uppercase',letterSpacing:'0.5px'}} />
                  <EditableField value={exp.role}    onChange={v=>updateExp(i,'role',v)}    editMode={editMode} style={{fontSize:fz*0.8,color:accent,fontWeight:600,display:'block',marginTop:2}} />
                </div>
                <EditableField value={exp.period} onChange={v=>updateExp(i,'period',v)} editMode={editMode} style={{fontSize:fz*0.78,color:'#888',fontWeight:500}} />
              </div>
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<div style={{width:16,height:16,borderRadius:3,background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}><span style={{color:'#fff',fontSize:7,fontWeight:700}}>✓</span></div>} />
            </div>
          ))}
        </BS>}
        {(editMode||data.projects.length>0)&&<BS label="Projects">{data.projects.map((p,i)=>(<div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:5,background:'#f8fafc',borderLeft:`4px solid ${accent}`,borderRadius:'0 6px 6px 0',padding:'6px 12px'}}><div style={{width:14,height:14,borderRadius:3,background:accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}><span style={{color:'#fff',fontSize:8,fontWeight:700}}>→</span></div>{editMode?<><input value={p} onChange={ev=>updateListItem('projects',i,ev.target.value)} style={{flex:1,background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'1px 5px',fontSize:fz*0.86,fontFamily:'inherit',outline:'none',color:'#111'}}/><span onClick={()=>removeListItem('projects',i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:12}}>×</span></>:<span style={{fontSize:fz*0.86,color:'#374151'}}>{p}</span>}</div>))}{editMode&&<button onClick={()=>addListItem('projects','Project — description')} style={{background:'transparent',border:`1px dashed ${accent}`,color:accent,borderRadius:4,padding:'2px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:4}}>+ Add Project</button>}</BS>}
        {(editMode||data.certifications.length>0)&&<BS label="Certifications"><div style={{display:'flex',flexWrap:'wrap',gap:7}}>{data.certifications.map((c,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:4,background:`${accent}15`,border:`1px solid ${accent}40`,borderRadius:6,padding:'3px 10px',fontSize:fz*0.8,color:'#374151',fontWeight:500}}>{editMode?<><input value={c} onChange={ev=>updateListItem('certifications',i,ev.target.value)} style={{background:'transparent',border:'none',padding:0,fontSize:fz*0.8,fontFamily:'inherit',outline:'none',color:'#374151'}}/><span onClick={()=>removeListItem('certifications',i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:11}}>×</span></>:c}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:`1px dashed ${accent}`,color:accent,borderRadius:6,padding:'3px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit',fontWeight:500}}>+ Add</button>}</div></BS>}
        {(editMode||data.references)&&<BS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.88,color:'#374151',fontStyle:'italic'}} /></BS>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   5. EXECUTIVE — luxury serif, gold accent rules
══════════════════════════════════════════════════ */
function ExecutiveCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
  const gold=accent;
  const ES=({label,children})=>(
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <div style={{height:'1px',width:24,background:gold,opacity:0.6}}/>
        <span style={{fontSize:fz*0.7,fontWeight:400,letterSpacing:'4px',textTransform:'uppercase',color:gold,}}>{label}</span>
        <div style={{flex:1,height:'1px',background:gold,opacity:0.6}}/>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fdfcf8',padding:'48px 52px',flex: 1, minHeight: '100%',color:'#1a1510'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.6,fontWeight:300,color:'#1a1510',letterSpacing:'6px',textTransform:'uppercase',display:'block',}} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,margin:'10px 0'}}>
          <div style={{height:'0.5px',width:60,background:gold}}/><div style={{width:6,height:6,borderRadius:'50%',background:gold}}/><div style={{height:'0.5px',width:60,background:gold}}/>
        </div>
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.95,color:'#6b5a3e',fontWeight:300,letterSpacing:'3px',textTransform:'uppercase',display:'block'}} />
        <div style={{marginTop:10,fontSize:fz*0.78,color:'#9a8b75',display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'4px 16px'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<ES label="Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.92,color:'#3d3228',lineHeight:1.85,fontWeight:300,fontStyle:'italic',textAlign:'center'}} /></ES>}
      {(editMode||data.skills.length>0)&&<ES label="Areas of Expertise"><div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'4px 20px'}}>{data.skills.map((s,i)=>(<span key={i} style={{fontSize:fz*0.86,color:'#5a4a35',letterSpacing:'1px'}}>{editMode?<input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',color:'#5a4a35',fontSize:fz*0.86,fontFamily:'inherit',outline:'none'}}/>:s}{i<data.skills.length-1&&<span style={{color:gold,margin:'0 8px',opacity:0.5}}>◆</span>}</span>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#9a8b75'}}>+ Add</button>}</div></ES>}
      {(editMode||data.education.length>0)&&<ES label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'◆',sx:{color:gold,fontSize:8,marginTop:4,opacity:0.6}}} itemSx={{fontSize:fz*0.9,color:'#3d3228',fontWeight:300}} /></ES>}
      {(editMode||data.experience.length>0)&&<ES label="Professional Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{marginBottom:18,paddingBottom:18,borderBottom:i<data.experience.length-1?`0.5px solid ${gold}25`:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz,color:'#1a1510',letterSpacing:'1px'}} />
              <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.78,color:gold,fontWeight:300,fontStyle:'italic'}} />
            </div>
            <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.88,color:'#6b5a3e',fontStyle:'italic',marginBottom:7,display:'block',fontWeight:300}} />
            <ExpBullets exp={exp} idx={i} accent={gold} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:gold,fontSize:8,flexShrink:0,marginTop:4,opacity:0.7}}>◆</span>} />
          </div>
        ))}
      </ES>}
      {(editMode||data.certifications.length>0)&&<ES label="Certifications"><EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'◆',sx:{color:gold,fontSize:8,marginTop:4,opacity:0.6}}} itemSx={{fontSize:fz*0.88,color:'#3d3228',fontWeight:300}} /></ES>}
  {(editMode||data.projects.length>0)&&<ES label="Selected Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'◆',sx:{color:gold,fontSize:8,marginTop:4,opacity:0.6}}} itemSx={{fontSize:fz*0.88,color:'#3d3228',fontWeight:300}} /></ES>}
      {(editMode||data.references)&&<ES label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.88,color:'#6b5a3e',fontStyle:'italic',textAlign:'center',display:'block'}} /></ES>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   6. TECH — dark terminal, mono font
══════════════════════════════════════════════════ */
function TechCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap');
  const green=accent;
  const bg='#0d1117'; const bg2='#161b22'; const border='#30363d'; const muted='#8b949e';
  const TS=({label,children})=>(
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span style={{color:green,fontSize:fz*0.8,fontWeight:500}}>{'>'}</span>
        <span style={{fontSize:fz*0.75,fontWeight:500,letterSpacing:'1px',color:green,textTransform:'uppercase'}}>{label}</span>
        <div style={{flex:1,height:'1px',background:border}}/>
      </div>
      {children}
    </div>
  );
  const inputSx={background:'rgba(255,255,255,0.05)',border:`1px dashed ${green}60`,borderRadius:3,color:'#e6edf3',fontSize:fz*0.84,outline:'none',padding:'2px 6px'};
  return (
    <div style={{fontSize:fz,background:bg,flex: 1, minHeight: '100%',color:'#e6edf3'}}>
      <div style={{background:bg2,borderBottom:`1px solid ${border}`,padding:'24px 28px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <span style={{color:green,fontSize:fz*0.85}}>~/</span>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.7,fontWeight:600,color:'#e6edf3',letterSpacing:'-0.5px'}} inputStyle={inputSx} />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span style={{color:muted,fontSize:fz*0.8}}>$</span>
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.85,color:green,fontWeight:400}} inputStyle={inputSx} />
        </div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:fz*0.75,color:muted}}>
          {[['📍',data.location],['📞',data.phone],['✉',data.email1],['🔗',data.linkedin]].filter(([,v])=>editMode||v).map(([icon,v],i)=><span key={i}>{icon} {v||'—'}</span>)}
        </div>
      </div>
      <div style={{padding:'20px 28px'}}>
        {(editMode||data.summary)&&<TS label="README.md"><div style={{background:bg2,border:`1px solid ${border}`,borderRadius:6,padding:'10px 14px'}}><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.84,color:'#c9d1d9',lineHeight:1.7,fontWeight:300}} /></div></TS>}
        {(editMode||data.skills.length>0)&&<TS label="tech_stack.json"><div style={{background:bg2,border:`1px solid ${border}`,borderRadius:6,padding:'10px 14px',display:'flex',flexWrap:'wrap',gap:6}}>
          {data.skills.map((s,i)=>(<span key={i} style={{background:`${green}18`,border:`1px solid ${green}40`,color:green,borderRadius:4,padding:'2px 9px',fontSize:fz*0.79,fontWeight:500}}>
            {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{...inputSx,background:'transparent',border:'none',padding:0,width:Math.max(44,s.length*8)}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#f85149',fontWeight:700,fontSize:11,marginLeft:3}}>×</span></>:s}
          </span>))}
          {editMode&&<button onClick={addSkill} style={{background:'transparent',border:`1px dashed ${green}60`,borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:green}}>+ Add</button>}
        </div></TS>}
        {(editMode||data.education.length>0)&&<TS label="education.log"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'>',sx:{color:green,fontSize:fz*0.8}}} itemSx={{fontSize:fz*0.84,color:'#c9d1d9'}} inputSx={inputSx} /></TS>}
        {(editMode||data.experience.length>0)&&<TS label="experience.log">
          {data.experience.map((exp,i)=>(
            <div key={i} style={{marginBottom:14,background:bg2,border:`1px solid ${border}`,borderRadius:6,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:3}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz*0.95,color:'#e6edf3'}} inputStyle={inputSx} />
                <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:muted}} inputStyle={inputSx} />
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                <span style={{color:green,fontSize:fz*0.8}}>$</span>
                <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.84,color:green}} inputStyle={inputSx} />
              </div>
              <ExpBullets exp={exp} idx={i} accent={green} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:green,fontSize:fz*0.75,flexShrink:0,marginTop:2}}>{'>'}</span>} />
            </div>
          ))}
        </TS>}
        {(editMode||data.projects.length>0)&&<TS label="projects/"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'>',sx:{color:green,fontSize:fz*0.8}}} itemSx={{fontSize:fz*0.84,color:'#c9d1d9'}} inputSx={inputSx} /></TS>}
        {(editMode||data.certifications.length>0)&&<TS label="certs.txt"><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{data.certifications.map((c,i)=>(<span key={i} style={{background:bg2,border:`1px solid ${border}`,color:muted,borderRadius:4,padding:'2px 8px',fontSize:fz*0.78}}>{c}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:`1px dashed ${green}60`,borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:green}}>+ Add</button>}</div></TS>}
        {(editMode||data.references)&&<TS label="references.txt"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.82,color:muted,fontStyle:'italic'}} /></TS>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   7. CREATIVE — diagonal colour block, asymmetric
══════════════════════════════════════════════════ */
function CreativeCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap');
  const CR=({label,children})=>(
    <div style={{marginBottom:18}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <div style={{width:8,height:8,borderRadius:2,background:accent,transform:'rotate(45deg)',flexShrink:0}}/>
        <span style={{fontSize:fz*0.7,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:accent}}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',flex: 1, minHeight: '100%',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-30,right:-30,width:220,height:220,borderRadius:'50%',background:`${accent}10`,pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:0,left:0,width:'38%',minHeight:'100%',background:accent,clipPath:'polygon(0 0,100% 0,82% 100%,0 100%)',zIndex:0,pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flex: 1, minHeight: '100%'}}>
        <div style={{width:'36%',padding:'32px 16px 32px 22px',color:'#fff',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{paddingBottom:14,borderBottom:'1px solid rgba(255,255,255,0.25)'}}>
            <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.55,fontWeight:800,color:'#fff',lineHeight:1.15,display:'block'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)'}} />
            <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.82,color:'rgba(255,255,255,0.8)',fontWeight:400,marginTop:5,display:'block',letterSpacing:'0.5px'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)'}} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5,fontSize:fz*0.78}}>
            {[['📍',data.location,v=>update('location',v)],['📞',data.phone,v=>update('phone',v)],['✉',data.email1,v=>update('email1',v)],['🔗',data.linkedin,v=>update('linkedin',v)]].map(([icon,val,fn],i)=>(
              <ContactLine key={i} icon={icon} value={val} onChange={fn} editMode={editMode} sx={{color:'rgba(255,255,255,0.85)'}} inputSx={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',fontSize:fz*0.78}} />
            ))}
          </div>
          {(editMode||data.skills.length>0)&&<div>
            <div style={{fontSize:fz*0.65,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:7}}>Skills</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
              {data.skills.map((s,i)=>(<span key={i} style={{background:'rgba(255,255,255,0.2)',color:'#fff',borderRadius:20,padding:'2px 9px',fontSize:fz*0.76,fontWeight:600}}>
                {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'transparent',border:'none',padding:0,color:'#fff',fontSize:fz*0.76,fontFamily:'inherit',outline:'none',width:Math.max(36,s.length*7)}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'rgba(255,100,100,0.9)',fontWeight:700,fontSize:10,marginLeft:2}}>×</span></>:s}
              </span>))}
              {editMode&&<button onClick={addSkill} style={{background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',borderRadius:20,padding:'2px 9px',color:'#fff',cursor:'pointer',fontSize:11,fontFamily:'inherit',fontWeight:600}}>+ Add</button>}
            </div>
          </div>}
          {(editMode||data.education.length>0)&&<div>
            <div style={{fontSize:fz*0.65,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:6}}>Education</div>
            <EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'◆',sx:{color:'rgba(255,255,255,0.5)',fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.78,color:'rgba(255,255,255,0.9)',lineHeight:1.4}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)',color:'#fff',fontSize:fz*0.78}} />
          </div>}
        </div>
        <div style={{flex:1,padding:'32px 26px 32px 20px'}}>
          {(editMode||data.summary)&&<CR label="About Me"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#444',lineHeight:1.65}} /></CR>}
          {(editMode||data.experience.length>0)&&<CR label="Experience">
            {data.experience.map((exp,i)=>(
              <div key={i} style={{paddingLeft:10,borderLeft:`3px solid ${accent}30`,paddingBottom:i<data.experience.length-1?10:0,marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz,color:'#1a1a2e'}} />
                  <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#999'}} />
                </div>
                <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.84,color:accent,fontWeight:700,marginBottom:5,display:'block'}} />
                <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<div style={{width:6,height:6,borderRadius:'50%',background:accent,flexShrink:0,marginTop:4}}/>} />
              </div>
            ))}
          </CR>}
          {(editMode||data.projects.length>0)&&<CR label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'◆',sx:{color:accent,fontSize:8,marginTop:4}}} itemSx={{fontSize:fz*0.85,color:'#555'}} /></CR>}
          {(editMode||data.certifications.length>0)&&<CR label="Certifications"><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{data.certifications.map((c,i)=>(<span key={i} style={{background:`${accent}15`,border:`1.5px solid ${accent}35`,color:accent,borderRadius:20,padding:'2px 10px',fontSize:fz*0.78,fontWeight:600}}>{c}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:`1.5px dashed ${accent}`,borderRadius:20,padding:'2px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:accent}}>+ Add</button>}</div></CR>}
          {(editMode||data.references)&&<CR label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'#666',fontStyle:'italic'}} /></CR>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   8. ACADEMIC — two-column scholarly layout
══════════════════════════════════════════════════ */
function AcademicCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
  const AS=({label,children})=>(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:fz*0.78,fontWeight:600,color:accent,textTransform:'uppercase',letterSpacing:'1.5px',borderBottom:`0.5px solid ${accent}`,paddingBottom:3,marginBottom:8}}>{label}</div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',padding:'32px 36px',flex: 1, minHeight: '100%',color:'#111'}}>
      <div style={{textAlign:'center',borderBottom:`2px solid ${accent}`,paddingBottom:14,marginBottom:22}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.9,fontWeight:600,color:'#111',display:'block',letterSpacing:'0.5px'}} />
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.88,color:accent,display:'block',marginTop:4,fontStyle:'italic'}} />
        <div style={{marginTop:8,fontSize:fz*0.76,color:'#666',display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'0 14px'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{display:'flex',gap:28}}>
        <div style={{flex:2}}>
          {(editMode||data.summary)&&<AS label="Research Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.9,color:'#333',lineHeight:1.75}} /></AS>}
          {(editMode||data.experience.length>0)&&<AS label="Academic & Professional Experience">
            {data.experience.map((exp,i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz*0.95,color:'#111'}} />
                  <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#888',fontStyle:'italic'}} />
                </div>
                <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.86,color:accent,fontStyle:'italic',marginBottom:5,display:'block'}} />
                <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:accent,fontSize:fz*0.7,flexShrink:0,marginTop:3}}>•</span>} />
              </div>
            ))}
          </AS>}
          {(editMode||data.projects.length>0)&&<AS label="Selected Projects / Publications"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'•',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.88,color:'#333',lineHeight:1.5}} /></AS>}
        </div>
        <div style={{flex:1,borderLeft:`0.5px solid ${accent}25`,paddingLeft:20}}>
          {(editMode||data.skills.length>0)&&<AS label="Expertise"><div style={{display:'flex',flexDirection:'column',gap:4}}>{data.skills.map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:3,height:3,borderRadius:'50%',background:accent,flexShrink:0}}/>
            {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'1px 4px',fontSize:fz*0.84,fontFamily:'inherit',outline:'none',flex:1}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:11}}>×</span></>:<span style={{fontSize:fz*0.84,color:'#444'}}>{s}</span>}
          </div>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'1px 7px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginTop:3}}>+ Add</button>}</div></AS>}
          {(editMode||data.education.length>0)&&<AS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'•',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.84,color:'#333',lineHeight:1.45}} /></AS>}
          {(editMode||data.certifications.length>0)&&<AS label="Certifications"><EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'•',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.84,color:'#333'}} /></AS>}
          {(editMode||data.references)&&<AS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.84,color:'#666',fontStyle:'italic'}} /></AS>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   9. CORPORATE — structured, tabular, formal
══════════════════════════════════════════════════ */
function CorporateCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300&display=swap');
  const COS=({label,children})=>(
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',alignItems:'stretch',gap:0,marginBottom:8}}>
        <div style={{width:4,background:accent,borderRadius:'2px 0 0 2px'}}/>
        <div style={{background:`${accent}12`,padding:'5px 12px',flex:1}}>
          <span style={{fontSize:fz*0.72,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:accent}}>{label}</span>
        </div>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',padding:'28px 32px',flex: 1, minHeight: '100%',color:'#1a1a1a'}}>
      <div style={{background:`${accent}`,padding:'18px 24px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.65,fontWeight:700,color:'#fff',display:'block',letterSpacing:'0.5px'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.5)'}} />
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.84,color:'rgba(255,255,255,0.85)',fontWeight:300,marginTop:3,letterSpacing:'1px',textTransform:'uppercase',display:'block'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.4)'}} />
        </div>
        <div style={{fontSize:fz*0.76,color:'rgba(255,255,255,0.8)',textAlign:'right',display:'flex',flexDirection:'column',gap:2}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<COS label="Professional Summary"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#333',lineHeight:1.65}} /></COS>}
      {(editMode||data.skills.length>0)&&<COS label="Core Competencies"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'4px 12px'}}>{data.skills.map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'3px 0',borderBottom:'0.5px solid #f1f5f9'}}>
        <div style={{width:4,height:4,borderRadius:'50%',background:accent,flexShrink:0}}/>
        {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'1px 4px',fontSize:fz*0.82,fontFamily:'inherit',outline:'none',flex:1}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:10}}>×</span></>:<span style={{fontSize:fz*0.82,color:'#444'}}>{s}</span>}
      </div>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'1px 7px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b'}}>+ Add</button>}</div></COS>}
      {(editMode||data.education.length>0)&&<COS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'▪',sx:{color:accent,fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.86,color:'#333'}} /></COS>}
      {(editMode||data.experience.length>0)&&<COS label="Work Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'0 14px',marginBottom:12,paddingBottom:12,borderBottom:i<data.experience.length-1?'0.5px solid #e2e8f0':'none'}}>
            <div style={{width:3,background:`${accent}30`,borderRadius:2}}/>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz*0.96,color:'#1a1a1a'}} />
                <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#888',fontWeight:300}} />
              </div>
              <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.84,color:accent,fontWeight:500,marginBottom:5,display:'block'}} />
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:accent,fontSize:7,flexShrink:0,marginTop:4}}>▪</span>} />
            </div>
          </div>
        ))}
      </COS>}
      {(editMode||data.projects.length>0)&&<COS label="Key Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'▪',sx:{color:accent,fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.86,color:'#333'}} /></COS>}
      {(editMode||data.certifications.length>0)&&<COS label="Certifications"><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{data.certifications.map((c,i)=>(<span key={i} style={{background:`${accent}10`,border:`1px solid ${accent}30`,borderRadius:4,padding:'2px 10px',fontSize:fz*0.8,color:'#374151',fontWeight:500}}>{c}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:`1px dashed ${accent}`,borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:accent}}>+ Add</button>}</div></COS>}
      {(editMode||data.references)&&<COS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.86,color:'#666',fontStyle:'italic'}} /></COS>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   10. TIMELINE — vertical timeline for experience
══════════════════════════════════════════════════ */
function TimelineCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,300;0,400;0,600;0,700;1,300&display=swap');
  const TLS=({label,children})=>(
    <div style={{marginBottom:20}}>
      <div style={{fontSize:fz*0.68,fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',color:accent,marginBottom:10,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:20,height:2,background:accent}}/>{label}<div style={{flex:1,height:'1px',background:`${accent}25`}}/>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',flex: 1, minHeight: '100%',display:'flex'}}>
      <div style={{width:'30%',background:'#f8fafc',borderRight:`1px solid #e2e8f0`,padding:'28px 18px',display:'flex',flexDirection:'column',gap:18}}>
        <div>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.45,fontWeight:700,color:'#111',lineHeight:1.2,display:'block'}} />
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.82,color:accent,fontWeight:600,marginTop:5,display:'block',letterSpacing:'0.3px'}} />
          <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:4,fontSize:fz*0.77,color:'#64748b'}}>
            {[['📍',data.location,v=>update('location',v)],['📞',data.phone,v=>update('phone',v)],['✉',data.email1,v=>update('email1',v)],['🔗',data.linkedin,v=>update('linkedin',v)]].map(([icon,val,fn],i)=>(<ContactLine key={i} icon={icon} value={val} onChange={fn} editMode={editMode} sx={{color:'#64748b',fontSize:fz*0.77}} />))}
          </div>
        </div>
        {(editMode||data.skills.length>0)&&<TLS label="Skills"><div style={{display:'flex',flexDirection:'column',gap:4}}>
          {data.skills.map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:3,height:3,borderRadius:'50%',background:accent,flexShrink:0}}/>
            {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'1px 4px',fontSize:fz*0.82,fontFamily:'inherit',outline:'none',flex:1}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:11}}>×</span></>:<span style={{fontSize:fz*0.82,color:'#374151'}}>{s}</span>}
          </div>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'1px 7px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginTop:3}}>+ Add</button>}
        </div></TLS>}
        {(editMode||data.education.length>0)&&<TLS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'•',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.8,color:'#374151',lineHeight:1.4}} /></TLS>}
        {(editMode||data.certifications.length>0)&&<TLS label="Certifications"><EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'•',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.8,color:'#374151'}} /></TLS>}
        {(editMode||data.references)&&<TLS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.8,color:'#64748b',fontStyle:'italic'}} /></TLS>}
      </div>
      <div style={{flex:1,padding:'28px 24px'}}>
        {(editMode||data.summary)&&<TLS label="Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#444',lineHeight:1.65}} /></TLS>}
        {(editMode||data.experience.length>0)&&<TLS label="Experience">
          <div style={{position:'relative',paddingLeft:20}}>
            <div style={{position:'absolute',left:7,top:0,bottom:0,width:'1.5px',background:`${accent}30`}}/>
            {data.experience.map((exp,i)=>(
              <div key={i} style={{position:'relative',marginBottom:18,paddingBottom:i<data.experience.length-1?18:0,borderBottom:i<data.experience.length-1?`1px dashed ${accent}15`:'none'}}>
                <div style={{position:'absolute',left:-20,top:3,width:12,height:12,borderRadius:'50%',background:'#fff',border:`2.5px solid ${accent}`,boxSizing:'border-box'}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz,color:'#111'}} />
                  <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#94a3b8',background:`${accent}10`,padding:'1px 6px',borderRadius:4}} />
                </div>
                <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.84,color:accent,fontWeight:600,marginBottom:6,display:'block'}} />
                <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} />
              </div>
            ))}
          </div>
        </TLS>}
        {(editMode||data.projects.length>0)&&<TLS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'▸',sx:{color:accent,fontSize:10,marginTop:2}}} itemSx={{fontSize:fz*0.85,color:'#555'}} /></TLS>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   11. INFOGRAPHIC — skill bars, badge icons
══════════════════════════════════════════════════ */
function InfographicCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  const IS=({label,icon,children})=>(
    <div style={{marginBottom:18}}>
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:9}}>
        <span style={{fontSize:14}}>{icon}</span>
        <span style={{fontSize:fz*0.7,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:accent}}>{label}</span>
        <div style={{flex:1,height:'1px',background:`${accent}20`}}/>
      </div>
      {children}
    </div>
  );
  /* fake skill-bar levels — 5 is max */
  const skillLevel = (s) => { const h=s.split('').reduce((a,c)=>a+c.charCodeAt(0),0); return (h%4)+2; };
  return (
    <div style={{fontSize:fz,background:'#fff',flex: 1, minHeight: '100%',display:'flex'}}>
      <div style={{width:'35%',background:`${accent}`,padding:'28px 18px',color:'#fff',display:'flex',flexDirection:'column',gap:16}}>
        <div style={{textAlign:'center',paddingBottom:16,borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
          <div style={{width:70,height:70,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'3px solid rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',fontSize:fz*1.8,fontWeight:700,color:'#fff'}}>{data.name?data.name[0].toUpperCase():'?'}</div>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.2,fontWeight:700,color:'#fff',display:'block',textAlign:'center'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',textAlign:'center'}} />
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.76,color:'rgba(255,255,255,0.8)',fontWeight:400,marginTop:4,display:'block',textAlign:'center',letterSpacing:'0.3px'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',textAlign:'center'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5,fontSize:fz*0.76}}>
          {[['📍',data.location],['📞',data.phone],['✉',data.email1],['🔗',data.linkedin]].filter(([,v])=>editMode||v).map(([icon,v],i)=><div key={i} style={{display:'flex',gap:6,alignItems:'flex-start',color:'rgba(255,255,255,0.85)'}}><span style={{opacity:0.7,flexShrink:0}}>{icon}</span><span style={{wordBreak:'break-all'}}>{v||'—'}</span></div>)}
        </div>
        {(editMode||data.skills.length>0)&&<div>
          <div style={{fontSize:fz*0.65,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:8}}>Skills</div>
          {data.skills.map((s,i)=>(
            <div key={i} style={{marginBottom:7}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                {editMode?<input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',borderRadius:3,padding:'0 5px',color:'#fff',fontSize:fz*0.78,fontFamily:'inherit',outline:'none',flex:1}}/>:<span style={{fontSize:fz*0.78,color:'rgba(255,255,255,0.9)'}}>{s}</span>}
                {editMode&&<span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'rgba(255,100,100,0.9)',fontWeight:700,fontSize:11,marginLeft:4}}>×</span>}
              </div>
              <div style={{height:4,background:'rgba(255,255,255,0.2)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${skillLevel(s)*20}%`,background:'rgba(255,255,255,0.75)',borderRadius:2,transition:'width 0.3s'}}/>
              </div>
            </div>
          ))}
          {editMode&&<button onClick={addSkill} style={{background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',borderRadius:4,padding:'2px 8px',color:'#fff',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:4}}>+ Add Skill</button>}
        </div>}
        {(editMode||data.education.length>0)&&<div>
          <div style={{fontSize:fz*0.65,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:6}}>Education</div>
          <EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'🎓',sx:{fontSize:11}}} itemSx={{fontSize:fz*0.78,color:'rgba(255,255,255,0.9)',lineHeight:1.35}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',color:'#fff',fontSize:fz*0.78}} />
        </div>}
      </div>
      <div style={{flex:1,padding:'28px 24px'}}>
        {(editMode||data.summary)&&<IS label="About" icon="👤"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.87,color:'#444',lineHeight:1.65}} /></IS>}
        {(editMode||data.experience.length>0)&&<IS label="Experience" icon="💼">
          {data.experience.map((exp,i)=>(
            <div key={i} style={{paddingLeft:10,borderLeft:`3px solid ${accent}`,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz*0.96,color:'#111'}} />
                <span style={{background:`${accent}18`,color:accent,borderRadius:20,padding:'1px 8px',fontSize:fz*0.72,fontWeight:600,whiteSpace:'nowrap'}}>{exp.period}</span>
              </div>
              <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.82,color:accent,fontWeight:500,marginBottom:5,display:'block'}} />
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<div style={{width:6,height:6,borderRadius:'50%',background:`${accent}40`,flexShrink:0,marginTop:4}}/>} />
            </div>
          ))}
        </IS>}
        {(editMode||data.projects.length>0)&&<IS label="Projects" icon="🚀"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'🚀',sx:{fontSize:11}}} itemSx={{fontSize:fz*0.85,color:'#555'}} /></IS>}
        {(editMode||data.certifications.length>0)&&<IS label="Certifications" icon="🏅"><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{data.certifications.map((c,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:4,background:`${accent}12`,border:`1.5px solid ${accent}35`,color:accent,borderRadius:20,padding:'3px 10px',fontSize:fz*0.78,fontWeight:500}}>🏅 {editMode?<><input value={c} onChange={ev=>updateListItem('certifications',i,ev.target.value)} style={{background:'transparent',border:'none',padding:0,fontSize:fz*0.78,fontFamily:'inherit',outline:'none',color:accent,width:Math.max(40,c.length*7)}}/><span onClick={()=>removeListItem('certifications',i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:11}}>×</span></>:c}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:`1.5px dashed ${accent}`,borderRadius:20,padding:'3px 10px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:accent}}>+ Add</button>}</div></IS>}
        {(editMode||data.references)&&<IS label="References" icon="👥"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'#666',fontStyle:'italic'}} /></IS>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   12. NORDIC — ultra-minimal Scandinavian
══════════════════════════════════════════════════ */
function NordicCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  const NS=({label,children})=>(
    <div style={{marginBottom:28}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{width:16,height:2,background:accent}}/>
        <span style={{fontSize:fz*0.66,fontWeight:700,letterSpacing:'4px',textTransform:'uppercase',color:'#999'}}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',padding:'52px 56px',flex: 1, minHeight: '100%',color:'#111'}}>
      <div style={{marginBottom:44}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.8,fontWeight:200,color:'#111',letterSpacing:'-2px',lineHeight:1,display:'block'}} />
        <div style={{marginTop:12,display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:32,height:1.5,background:accent}}/>
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.82,color:'#777',fontWeight:400,letterSpacing:'2px',textTransform:'uppercase'}} />
        </div>
        <div style={{marginTop:14,display:'flex',gap:20,flexWrap:'wrap',fontSize:fz*0.74,color:'#aaa'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(v=>editMode||v).map((v,i)=><span key={i}>{v||'—'}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<NS label="Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.9,color:'#444',lineHeight:1.9,fontWeight:300,maxWidth:'80%'}} /></NS>}
      {(editMode||data.skills.length>0)&&<NS label="Skills"><div style={{display:'flex',flexWrap:'wrap',gap:'6px 24px'}}>{data.skills.map((s,i)=>(<span key={i} style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:fz*0.82,color:'#555',fontWeight:300}}>
        <div style={{width:3,height:3,borderRadius:'50%',background:accent,flexShrink:0}}/>
        {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',fontSize:fz*0.82,fontFamily:'inherit',outline:'none'}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:10}}>×</span></>:s}
      </span>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 7px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b'}}>+ Add</button>}</div></NS>}
      {(editMode||data.education.length>0)&&<NS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'',sx:{display:'none'}}} itemSx={{fontSize:fz*0.85,color:'#444',fontWeight:300,lineHeight:1.5}} /></NS>}
      {(editMode||data.experience.length>0)&&<NS label="Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:16,marginBottom:20,paddingBottom:20,borderBottom:i<data.experience.length-1?'1px solid #f1f5f9':'none'}}>
            <div>
              <div style={{fontSize:fz*0.74,color:'#aaa',fontWeight:300,lineHeight:1.4}}>{exp.period}</div>
              <div style={{fontSize:fz*0.74,color:'#888',fontWeight:400,marginTop:2}}>{exp.company}</div>
            </div>
            <div>
              <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontWeight:600,fontSize:fz*0.9,color:'#111',marginBottom:6,display:'block'}} />
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<div style={{width:3,height:3,borderRadius:'50%',background:accent,flexShrink:0,marginTop:5}}/>} />
            </div>
          </div>
        ))}
      </NS>}
      {(editMode||data.projects.length>0)&&<NS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'',sx:{display:'none'}}} itemSx={{fontSize:fz*0.85,color:'#555',fontWeight:300,lineHeight:1.5}} /></NS>}
      {(editMode||data.certifications.length>0)&&<NS label="Certifications"><EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'',sx:{display:'none'}}} itemSx={{fontSize:fz*0.82,color:'#555',fontWeight:300}} /></NS>}
      {(editMode||data.references)&&<NS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.82,color:'#aaa',fontWeight:300,fontStyle:'italic'}} /></NS>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   13. ELEGANT — centered, all-caps, thin rules
══════════════════════════════════════════════════ */
function ElegantCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
  const ELS=({label,children})=>(
    <div style={{marginBottom:22}}>
      <div style={{textAlign:'center',position:'relative',marginBottom:14}}>
        <div style={{position:'absolute',top:'50%',left:0,right:0,height:'0.5px',background:`${accent}30`}}/>
        <span style={{position:'relative',background:'#fff',padding:'0 16px',fontSize:fz*0.68,fontWeight:700,letterSpacing:'4px',textTransform:'uppercase',color:accent}}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',padding:'44px 52px',flex: 1, minHeight: '100%',color:'#1a1a1a'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.2,fontWeight:700,color:'#1a1a1a',letterSpacing:'4px',textTransform:'uppercase',display:'block'}} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,margin:'10px 0 8px'}}>
          <div style={{height:'0.5px',flex:1,background:accent,opacity:0.4}}/><div style={{width:5,height:5,borderRadius:'50%',background:accent}}/><div style={{height:'0.5px',flex:1,background:accent,opacity:0.4}}/>
        </div>
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'#666',fontStyle:'italic',display:'block',marginBottom:8}} />
        <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'0 14px',fontSize:fz*0.76,color:'#888'}}>
          {[data.location,data.phone,data.email1,data.linkedin].filter(Boolean).map((v,i)=><span key={i}>{i>0&&<span style={{margin:'0 4px',opacity:0.4}}>·</span>}{v}</span>)}
        </div>
      </div>
      {(editMode||data.summary)&&<ELS label="Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.9,color:'#333',lineHeight:1.8,fontStyle:'italic',textAlign:'center'}} /></ELS>}
      {(editMode||data.skills.length>0)&&<ELS label="Competencies"><div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2px 18px'}}>
        {data.skills.map((s,i)=>(<span key={i} style={{fontSize:fz*0.84,color:'#444',display:'inline-flex',alignItems:'center',gap:3}}>
          {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',fontSize:fz*0.84,fontFamily:'inherit',outline:'none'}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700}}>×</span></>:s}
          {!editMode&&i<data.skills.length-1&&<span style={{color:accent,margin:'0 7px',fontSize:8,opacity:0.6}}>◆</span>}
        </span>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginLeft:6}}>+ Add</button>}
      </div></ELS>}
      {(editMode||data.education.length>0)&&<ELS label="Education"><div style={{textAlign:'center'}}><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'·',sx:{color:accent,fontSize:fz*0.7,marginTop:3}}} itemSx={{fontSize:fz*0.88,color:'#333'}} /></div></ELS>}
      {(editMode||data.experience.length>0)&&<ELS label="Experience">
        {data.experience.map((exp,i)=>(
          <div key={i} style={{textAlign:'center',marginBottom:16,paddingBottom:16,borderBottom:i<data.experience.length-1?`0.5px solid ${accent}20`:'none'}}>
            <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz*1.02,color:'#1a1a1a',letterSpacing:'1px',textTransform:'uppercase'}} />
            <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:2,marginBottom:6}}>
              <EditableField value={exp.role}   onChange={v=>updateExp(i,'role',v)}   editMode={editMode} style={{fontSize:fz*0.86,color:accent,fontStyle:'italic'}} />
              <span style={{color:'#ccc'}}>·</span>
              <EditableField value={exp.period} onChange={v=>updateExp(i,'period',v)} editMode={editMode} style={{fontSize:fz*0.82,color:'#888',fontStyle:'italic'}} />
            </div>
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {exp.bullets.map((b,j)=>(<li key={j} style={{fontSize:fz*0.84,color:'#555',lineHeight:1.65,display:'flex',alignItems:'flex-start',justifyContent:'center',gap:6}}>
                <span style={{color:accent,fontSize:8,marginTop:4,opacity:0.6}}>◆</span>
                <EditableField value={b} onChange={v=>updateBullet(i,j,v)} editMode={editMode} multiline style={{fontSize:fz*0.84,color:'#555',flex:'none',maxWidth:'80%',textAlign:'left'}} />
                {editMode&&<span onClick={()=>removeBullet(i,j)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:12}}>×</span>}
              </li>))}
            </ul>
            {editMode&&<button onClick={()=>addBullet(i)} style={{background:'transparent',border:`1px dashed ${accent}`,color:accent,borderRadius:4,padding:'1px 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',marginTop:5}}>+ bullet</button>}
          </div>
        ))}
      </ELS>}
      {(editMode||data.certifications.length>0)&&<ELS label="Certifications"><div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2px 16px'}}>{data.certifications.map((c,i)=>(<span key={i} style={{fontSize:fz*0.84,color:'#444',display:'inline-flex',alignItems:'center',gap:3}}>{c}{i<data.certifications.length-1&&<span style={{color:accent,margin:'0 6px',fontSize:8,opacity:0.5}}>◆</span>}</span>))}{editMode&&<button onClick={()=>addListItem('certifications','New')} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 8px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginLeft:8}}>+ Add</button>}</div></ELS>}
  {(editMode||data.projects.length>0)&&<ELS label="Projects"><div style={{textAlign:'center'}}><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'◆',sx:{color:accent,fontSize:8,marginTop:4,opacity:0.6}}} itemSx={{fontSize:fz*0.86,color:'#444'}} /></div></ELS>}
      {(editMode||data.references)&&<ELS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.86,color:'#666',fontStyle:'italic',textAlign:'center',display:'block'}} /></ELS>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   14. CHICAGO — newspaper editorial, two columns
══════════════════════════════════════════════════ */
function ChicagoCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
  const CHS=({label,children})=>(
    <div style={{marginBottom:16}}>
      <div style={{borderTop:`3px solid #111`,borderBottom:`1px solid #111`,padding:'3px 0',marginBottom:9}}>
        <span style={{fontSize:fz*0.7,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'#111'}}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fafaf8',flex: 1, minHeight: '100%',border:'2px solid #111'}}>
      <div style={{borderBottom:'3px solid #111',padding:'18px 28px',textAlign:'center',position:'relative'}}>
        <div style={{fontSize:fz*0.65,fontWeight:700,letterSpacing:'4px',textTransform:'uppercase',color:'#666',marginBottom:6}}>{data.location||'Location'} · {data.phone||'Phone'} · {data.email1||'email@example.com'}{data.linkedin&&` · ${data.linkedin}`}</div>
        <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*2.8,fontWeight:900,color:'#111',lineHeight:1,display:'block',letterSpacing:'-1px',}} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,margin:'6px 0'}}>
          <div style={{flex:1,height:'1px',background:'#111'}}/><span style={{fontSize:11}}>◆</span><div style={{flex:1,height:'1px',background:'#111'}}/>
        </div>
        <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.9,color:'#444',fontStyle:'italic',display:'block'}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1px 1fr',gap:0}}>
        <div style={{padding:'18px 22px'}}>
          {(editMode||data.summary)&&<CHS label="Profile"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.86,color:'#333',lineHeight:1.75,fontStyle:'italic'}} /></CHS>}
          {(editMode||data.skills.length>0)&&<CHS label="Competencies"><div>{data.skills.map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,paddingBottom:3,borderBottom:'0.5px solid #e5e7eb',marginBottom:3}}>
            <span style={{color:accent,fontSize:8,flexShrink:0}}>◆</span>
            {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'#fffbeb',border:'1px dashed #f59e0b',borderRadius:3,padding:'0 4px',fontSize:fz*0.84,fontFamily:'inherit',outline:'none',flex:1}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'#ef4444',fontWeight:700,fontSize:10}}>×</span></>:<span style={{fontSize:fz*0.84,color:'#333'}}>{s}</span>}
          </div>))}{editMode&&<button onClick={addSkill} style={{background:'transparent',border:'1px dashed #94a3b8',borderRadius:3,padding:'0 7px',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:'#64748b',marginTop:3}}>+ Add</button>}</div></CHS>}
          {(editMode||data.education.length>0)&&<CHS label="Education"><EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'◆',sx:{color:accent,fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.84,color:'#333',lineHeight:1.4}} /></CHS>}
          {(editMode||data.certifications.length>0)&&<CHS label="Certifications"><EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'◆',sx:{color:accent,fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.84,color:'#333'}} /></CHS>}
        </div>
        <div style={{background:'#111'}}/>
        <div style={{padding:'18px 22px'}}>
          {(editMode||data.experience.length>0)&&<CHS label="Experience">
            {data.experience.map((exp,i)=>(
              <div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:i<data.experience.length-1?'0.5px solid #ccc':'none'}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz*1.05,color:'#111',display:'block',fontStyle:'italic'}} />
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,marginTop:1}}>
                  <EditableField value={exp.role}   onChange={v=>updateExp(i,'role',v)}   editMode={editMode} style={{fontSize:fz*0.84,color:accent,fontWeight:700,fontStyle:'normal',letterSpacing:'0.5px'}} />
                  <EditableField value={exp.period} onChange={v=>updateExp(i,'period',v)} editMode={editMode} style={{fontSize:fz*0.76,color:'#888'}} />
                </div>
                <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<span style={{color:accent,fontSize:8,flexShrink:0,marginTop:3}}>◆</span>} />
              </div>
            ))}
          </CHS>}
          {(editMode||data.projects.length>0)&&<CHS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'◆',sx:{color:accent,fontSize:8,marginTop:3}}} itemSx={{fontSize:fz*0.84,color:'#333'}} /></CHS>}
          {(editMode||data.references)&&<CHS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.86,color:'#555',fontStyle:'italic'}} /></CHS>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   15. SUNSET — warm gradient sidebar
══════════════════════════════════════════════════ */
function SunsetCV({ data,update,updateExp,updateBullet,updateSkill,addSkill,removeSkill,addBullet,removeBullet,updateListItem,removeListItem,addListItem,accent,fz,editMode }) {
  loadFont('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
  /* warm gradient using accent as base hue */
  const SS=({label,children})=>(
    <div style={{marginBottom:18}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
        <div style={{width:18,height:2.5,borderRadius:2,background:`linear-gradient(90deg,${accent},#f97316)`}}/>
        <span style={{fontSize:fz*0.7,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:accent}}>{label}</span>
      </div>
      {children}
    </div>
  );
  return (
    <div style={{fontSize:fz,background:'#fff',flex: 1, minHeight: '100%',display:'flex'}}>
      <div style={{width:'35%',background:`linear-gradient(160deg,${accent} 0%,#f97316 100%)`,padding:'28px 18px',color:'#fff',display:'flex',flexDirection:'column',gap:16}}>
        <div style={{paddingBottom:14,borderBottom:'1px solid rgba(255,255,255,0.25)',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(255,255,255,0.25)',border:'3px solid rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',fontSize:fz*1.6,fontWeight:700,color:'#fff'}}>{data.name?data.name[0].toUpperCase():'?'}</div>
          <EditableField value={data.name} onChange={v=>update('name',v)} editMode={editMode} style={{fontSize:fz*1.3,fontWeight:700,color:'#fff',display:'block',textAlign:'center'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',textAlign:'center'}} />
          <EditableField value={data.title} onChange={v=>update('title',v)} editMode={editMode} style={{fontSize:fz*0.78,color:'rgba(255,255,255,0.85)',fontWeight:500,marginTop:4,display:'block',textAlign:'center',letterSpacing:'0.5px'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',textAlign:'center'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:5,fontSize:fz*0.77}}>
          {[['📍',data.location,v=>update('location',v)],['📞',data.phone,v=>update('phone',v)],['✉',data.email1,v=>update('email1',v)],['🔗',data.linkedin,v=>update('linkedin',v)]].map(([icon,val,fn],i)=>(
            <ContactLine key={i} icon={icon} value={val} onChange={fn} editMode={editMode} sx={{color:'rgba(255,255,255,0.9)',fontSize:fz*0.77}} inputSx={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',fontSize:fz*0.77}} />
          ))}
        </div>
        {(editMode||data.skills.length>0)&&<div>
          <div style={{fontSize:fz*0.64,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:8}}>Skills</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {data.skills.map((s,i)=>(<span key={i} style={{background:'rgba(255,255,255,0.2)',backdropFilter:'blur(4px)',color:'#fff',borderRadius:20,padding:'3px 10px',fontSize:fz*0.76,fontWeight:600}}>
              {editMode?<><input value={s} onChange={e=>updateSkill(i,e.target.value)} style={{background:'transparent',border:'none',padding:0,color:'#fff',fontSize:fz*0.76,fontFamily:'inherit',outline:'none',width:Math.max(36,s.length*7)}}/><span onClick={()=>removeSkill(i)} style={{cursor:'pointer',color:'rgba(255,100,100,0.9)',fontWeight:700,fontSize:10,marginLeft:2}}>×</span></>:s}
            </span>))}
            {editMode&&<button onClick={addSkill} style={{background:'rgba(255,255,255,0.15)',border:'1px dashed rgba(255,255,255,0.4)',borderRadius:20,padding:'3px 9px',color:'#fff',cursor:'pointer',fontSize:11,fontFamily:'inherit',fontWeight:600}}>+ Add</button>}
          </div>
        </div>}
        {(editMode||data.education.length>0)&&<div>
          <div style={{fontSize:fz*0.64,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:6}}>Education</div>
          <EList items={data.education} field="education" editMode={editMode} onUpdate={(i,v)=>updateListItem('education',i,v)} onRemove={i=>removeListItem('education',i)} onAdd={t=>addListItem('education',t)} addLabel="Education" bullet={{char:'✦',sx:{color:'rgba(255,255,255,0.5)',fontSize:8,marginTop:4}}} itemSx={{fontSize:fz*0.77,color:'rgba(255,255,255,0.9)',lineHeight:1.4}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',color:'#fff',fontSize:fz*0.77}} />
        </div>}
        {(editMode||data.certifications.length>0)&&<div>
          <div style={{fontSize:fz*0.64,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:6}}>Certifications</div>
          <EList items={data.certifications} field="certifications" editMode={editMode} onUpdate={(i,v)=>updateListItem('certifications',i,v)} onRemove={i=>removeListItem('certifications',i)} onAdd={t=>addListItem('certifications',t)} addLabel="Cert" bullet={{char:'✦',sx:{color:'rgba(255,255,255,0.45)',fontSize:8,marginTop:4}}} itemSx={{fontSize:fz*0.77,color:'rgba(255,255,255,0.85)'}} inputSx={{background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)',color:'#fff',fontSize:fz*0.77}} />
        </div>}
        {(editMode||data.references)&&<div>
          <div style={{fontSize:fz*0.64,fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:4}}>References</div>
          <EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.77,color:'rgba(255,255,255,0.85)',fontStyle:'italic'}} inputStyle={{color:'#fff',background:'rgba(255,255,255,0.1)',border:'1px dashed rgba(255,255,255,0.35)'}} />
        </div>}
      </div>
      <div style={{flex:1,padding:'28px 26px'}}>
        {(editMode||data.summary)&&<SS label="About Me"><EditableField value={data.summary} onChange={v=>update('summary',v)} editMode={editMode} multiline style={{fontSize:fz*0.88,color:'#444',lineHeight:1.7}} /></SS>}
        {(editMode||data.experience.length>0)&&<SS label="Experience">
          {data.experience.map((exp,i)=>(
            <div key={i} style={{marginBottom:14,paddingLeft:10,borderLeft:`3px solid`,borderImageSource:`linear-gradient(180deg,${accent},#f97316)`,borderImageSlice:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                <EditableField value={exp.company} onChange={v=>updateExp(i,'company',v)} editMode={editMode} style={{fontWeight:700,fontSize:fz,color:'#1a1a2e'}} />
                <EditableField value={exp.period}  onChange={v=>updateExp(i,'period',v)}  editMode={editMode} style={{fontSize:fz*0.76,color:'#f97316',fontWeight:500}} />
              </div>
              <EditableField value={exp.role} onChange={v=>updateExp(i,'role',v)} editMode={editMode} style={{fontSize:fz*0.84,color:accent,fontWeight:700,marginBottom:5,display:'block'}} />
              <ExpBullets exp={exp} idx={i} accent={accent} fz={fz} editMode={editMode} updateExp={updateExp} updateBullet={updateBullet} addBullet={addBullet} removeBullet={removeBullet} bulletNode={<div style={{width:6,height:6,borderRadius:'50%',background:`linear-gradient(135deg,${accent},#f97316)`,flexShrink:0,marginTop:4}}/>} />
            </div>
          ))}
        </SS>}
        {(editMode||data.projects.length>0)&&<SS label="Projects"><EList items={data.projects} field="projects" editMode={editMode} onUpdate={(i,v)=>updateListItem('projects',i,v)} onRemove={i=>removeListItem('projects',i)} onAdd={t=>addListItem('projects',t)} addLabel="Project" bullet={{char:'✦',sx:{color:'#f97316',fontSize:9,marginTop:3}}} itemSx={{fontSize:fz*0.85,color:'#555'}} /></SS>}
        {(editMode||data.references)&&<SS label="References"><EditableField value={data.references||'Available upon request'} onChange={v=>update('references',v)} editMode={editMode} style={{fontSize:fz*0.85,color:'#666',fontStyle:'italic'}} /></SS>}
      </div>
    </div>
  );
}