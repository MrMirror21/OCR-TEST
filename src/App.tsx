import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null | undefined>(
    null
  );
  const [text, setText] = useState<Array<object>>();

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const base64 = e.target.result as string;
          setBase64Image(base64);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (base64Image === "") {
      window.alert("이미지를 선택해주세요");
      return;
    }
    base64Image && callGoogleVisionApi(String(getLastPart(base64Image)));
  };

  const getLastPart = (string: string) => {
    const lastCommaIndex = string.lastIndexOf(",");
    if (lastCommaIndex !== -1) {
      return string.slice(lastCommaIndex + 1);
    }
  };

  const callGoogleVisionApi = async (base64: string) => {
    const apiKey = import.meta.env.VITE_APP_GOOGLE_CLOUD_API_KEY;
    const url: string = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const headers = {
      "Content-Type": "application/json",
    };

    const body = {
      requests: [
        {
          image: {
            content: base64,
          },
          features: [
            {
              type: "TEXT_DETECTION",
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(url, body, { headers });
      const detectedText = response.data.responses[0].textAnnotations[0].description;
      setText(detectedText);
      console.log(detectedText);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return (
    <>
      <div style={{display: "flex", flexDirection: "column", gap: "20px", width: "400px"}}>
        {base64Image !== null ? (
          <img
            src={base64Image}
            alt="uploaded Image"
            style={{ width: "400px" }}
          />
        ) : (
          <div style={{ width: "400px", backgroundColor: "white" }}></div>
        )}
        <input type="file" onChange={onFileChange} />
        <button onClick={handleSubmit}>get text!</button>
        <p>{text ? String(text) : ""}</p>
      </div>
    </>
  );
}

export default App;
