import { useState, useRef, useEffect } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";

const tiles = [
  "Man1.svg",
  "Man2.svg",
  "Man3.svg",
  "Man4.svg",
  "Man5.svg",
  "Man5-Dora.svg",
  "Man6.svg",
  "Man7.svg",
  "Man8.svg",
  "Man9.svg",

  "Pin1.svg",
  "Pin2.svg",
  "Pin3.svg",
  "Pin4.svg",
  "Pin5.svg",
  "Pin5-Dora.svg",
  "Pin6.svg",
  "Pin7.svg",
  "Pin8.svg",
  "Pin9.svg",

  "Sou1.svg",
  "Sou2.svg",
  "Sou3.svg",
  "Sou4.svg",
  "Sou5.svg",
  "Sou5-Dora.svg",
  "Sou6.svg",
  "Sou7.svg",
  "Sou8.svg",
  "Sou9.svg",

  "Ton.svg",
  "Nan.svg",
  "Shaa.svg",
  "Pei.svg",
  "Haku.svg",
  "Hatsu.svg",
  "Chun.svg",

  "Back.svg",
];

export default function App() {
  const [images, setImages] = useState([]);
  const [targets, setTargets] = useState([]);
  const [elementGuidelines, setElementGuidelines] = useState([]);
  const [verticalGuidelines, setVerticalGuidelines] = useState([]);
  const [horizontalGuidelines, setHorizontalGuidelines] = useState([]);
  const moveableRef = useRef(null);
  const selectoRef = useRef(null);
  const containerRef = useRef(null);

  const idSequence = useRef(0);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id: idSequence.current, src: url }]);
      idSequence.current += 1;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (targets.length === 0) return;
        const removeIds = targets.map((t) => t.dataset.id);
        console.log(removeIds, images);
        setImages((prev) => prev.filter((img) => !removeIds.includes(String(img.id))));
        setTargets([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [targets]);

  useEffect(() => {
    setElementGuidelines(Array.from(document.querySelectorAll(".target")));
  }, [images]);

  useEffect(() => {
    setElementGuidelines(Array.from(document.querySelectorAll(".target")));

    const updateGuidelines = () => {
      setVerticalGuidelines([0, containerRef.current.offsetWidth]);
      setHorizontalGuidelines([0, containerRef.current.offsetHeight]);
    };

    updateGuidelines();

    const resizeObserver = new ResizeObserver(updateGuidelines);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const ButtonImg = ({ src }) => {
    return (
      <img
        className="w-10"
        src={src}
        onClick={() => {
          setImages((prev) => [...prev, { id: idSequence.current, src: src }]);
          idSequence.current += 1;
        }}
      />
    );
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <div
        className="relative overflow-hidden w-full h-full"
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Moveable
          ref={moveableRef}
          target={targets}
          origin={false}
          rotatable={true}
          throttleRotate={90}
          snappable={true}
          elementSnapDirections={{ left: true, top: true, right: true, bottom: true }}
          elementGuidelines={elementGuidelines}
          snapDirections={{ left: true, top: true, right: true, bottom: true }}
          verticalGuidelines={verticalGuidelines}
          horizontalGuidelines={horizontalGuidelines}
          isDisplaySnapDigit={false}
          draggable={true}
          onClickGroup={(e) => {
            selectoRef.current.clickTarget(e.inputEvent, e.inputTarget);
          }}
          onRender={(e) => {
            e.target.style.cssText += e.cssText;
          }}
          onRenderGroup={(e) => {
            e.events.forEach((ev) => {
              ev.target.style.cssText += ev.cssText;
            });
          }}
        />
        <Selecto
          ref={selectoRef}
          container={containerRef}
          selectableTargets={[".target"]}
          hitRate={0}
          selectByClick={true}
          selectFromInside={false}
          toggleContinueSelect={["shift"]}
          ratio={0}
          onDragStart={(e) => {
            const target = e.inputEvent.target;
            if (
              moveableRef.current.isMoveableElement(target) ||
              targets.some((t) => t === target || t.contains(target))
            ) {
              e.stop();
            }
          }}
          onSelect={(e) => {
            if (e.isDragStartEnd) {
              return;
            }
            setTargets(e.selected);
          }}
          onSelectEnd={(e) => {
            if (e.isDragStartEnd) {
              e.inputEvent.preventDefault();
              moveableRef.current.waitToChangeTarget().then(() => {
                moveableRef.current.dragStart(e.inputEvent);
              });
            }
            setTargets(e.selected);
          }}
        />
        {images &&
          images.map((img) => <img className="absolute target w-10" src={img.src} data-id={img.id} key={img.id} />)}
      </div>
      <div className="bg-gray-100">
        <div className=" inline-grid grid-cols-10 gap-x-4">
          {tiles.map((tile) => (
            <ButtonImg src={`tiles/${tile}`} key={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
