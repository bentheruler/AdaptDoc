import { useState } from "react";
import { generateDocument } from "../api/ai";

function Generate() {

  const [formData,setFormData] = useState({
    name:"",
    email:"",
    skills:"",
    education:"",
    experience:""
  });

  const [result,setResult] = useState("");

  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async () => {

    const res = await generateDocument("cv",formData);

    setResult(res.document);

  };

  return (
    <div>

      <h2>Generate CV</h2>

      <input name="name" placeholder="Name" onChange={handleChange}/>
      <input name="email" placeholder="Email" onChange={handleChange}/>
      <input name="skills" placeholder="Skills" onChange={handleChange}/>
      <input name="education" placeholder="Education" onChange={handleChange}/>
      <input name="experience" placeholder="Experience" onChange={handleChange}/>

      <button onClick={handleGenerate}>
        Generate
      </button>

      <h3>Generated Document</h3>

      <pre>{result}</pre>

    </div>
  );
}

export default Generate;