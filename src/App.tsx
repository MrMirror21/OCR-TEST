import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { useMotionValue, motion } from "framer-motion";
import styled from "styled-components";

const DRAG_BUFFER = 50; // 페이지 이동을 유발하는 드래그 길이

const slides = [
  {
    id: 1,
    text: "이벤트",
  },
];

// 애니메이션 설정
const SPRING_OPTIONS = {
  type: "spring",
  mass: 3,
  stiffness: 400,
  damping: 50,
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null | undefined>(
    null
  );
  const [text, setText] = useState<Array<object>>();

  const [page, setPage] = useState(0);
  const dragX = useMotionValue(0);
  const [width, setWidth] = useState<number>(0);

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
    const maxWidth =
      document.documentElement.clientWidth < 480
        ? document.documentElement.clientWidth
        : 400;
    setWidth(maxWidth);
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
      const detectedText =
        response.data.responses[0].textAnnotations[0].description;
      setText(detectedText);
      console.log(detectedText);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // 마우스 드래그를 통한 슬라이드 이동 함수
  const onDragEnd = () => {
    const x = dragX.get();

    x <= -DRAG_BUFFER &&
      page < slides.length - 1 &&
      setPage((point) => point + 1);
    x >= DRAG_BUFFER && page > 0 && setPage((point) => point - 1);
    x >= DRAG_BUFFER && page == 0 && alert("게시물 삭제")
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "400px",
        }}
      >
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
        <Background>
          <Carousel>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{
                x: dragX,
                width: "4000px",
                marginBottom: "20px",
              }}
              animate={{ translateX: `-${page * width}px` }}
              transition={SPRING_OPTIONS}
              onDragEnd={onDragEnd}
              className="container"
            >
              <Slide>삭제</Slide>
              {slides.map((slide, idx) => {
                return (
                  <SlideBg className="slideBg">
                    <motion.div key={idx} transition={SPRING_OPTIONS}>
                      <Slide>{slide.text}</Slide>
                    </motion.div>
                  </SlideBg>
                );
              })}
            </motion.div>
          </Carousel>
        </Background>
      </div>
    </>
  );
}

export default App;

const Background = styled.div`
  width: 400px;
  overflow: hidden;
`;

const Slide = styled.div`
  width: 100px;
  background: blue;
`;

const SlideBg = styled.div`
  width: 400px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  background: blue;
`;

const Carousel = styled.div`
  width: 4000px;
  background: white;
  overflow: hidden;
  transform: translateX(-100px);
  .container {
    display: flex;
    align-items: center;
    justify-content: start;
    overflow: hidden;
  }
  .slideBg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 400px;
    overflow: hidden;
  }
`;
