import { useState, useRef, useEffect } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
const tiles = [
  "tiles/Man1.svg",
  "tiles/Man2.svg",
  "tiles/Man3.svg",
  "tiles/Man4.svg",
  "tiles/Man5.svg",
  "tiles/Man5-Dora.svg",
  "tiles/Man6.svg",
  "tiles/Man7.svg",
  "tiles/Man8.svg",
  "tiles/Man9.svg",

  "tiles/Pin1.svg",
  "tiles/Pin2.svg",
  "tiles/Pin3.svg",
  "tiles/Pin4.svg",
  "tiles/Pin5.svg",
  "tiles/Pin5-Dora.svg",
  "tiles/Pin6.svg",
  "tiles/Pin7.svg",
  "tiles/Pin8.svg",
  "tiles/Pin9.svg",

  "tiles/Sou1.svg",
  "tiles/Sou2.svg",
  "tiles/Sou3.svg",
  "tiles/Sou4.svg",
  "tiles/Sou5.svg",
  "tiles/Sou5-Dora.svg",
  "tiles/Sou6.svg",
  "tiles/Sou7.svg",
  "tiles/Sou8.svg",
  "tiles/Sou9.svg",

  "tiles/Ton.svg",
  "tiles/Nan.svg",
  "tiles/Shaa.svg",
  "tiles/Pei.svg",
  "tiles/Haku.svg",
  "tiles/Hatsu.svg",
  "tiles/Chun.svg",

  "tiles/Back.svg",
];

type Image = {
  id: number;
  src: string;
  style?: React.CSSProperties;
};

export default function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [targets, setTargets] = useState<(HTMLElement | SVGElement)[]>([]);
  const [imageElements, setImageElements] = useState<Element[]>([]);
  const [elementGuidelines, setElementGuidelines] = useState<Element[]>([]);
  const [verticalGuidelines, setVerticalGuidelines] = useState<number[]>([]);
  const [horizontalGuidelines, setHorizontalGuidelines] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idSequence = useRef(0);
  const createSequence = useRef(0);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    files.forEach((file) => {
      const url = URL.createObjectURL(file);

      const tempImg = new Image();
      tempImg.onload = () => {
        const id = idSequence.current;
        const x = rect.width / 2 - tempImg.width / 2;
        const y = rect.height / 2 - tempImg.height / 2;
        setImages((prev) => [...prev, { id: id, src: url, style: { top: `${y}px`, left: `${x}px` } }]);
        idSequence.current += 1;
      };
      tempImg.src = url;
    });
  };

  useEffect(() => {
    setElementGuidelines(imageElements.filter((el) => !targets.includes(el as HTMLElement)));
  }, [targets, imageElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (targets.length === 0) return;
        const removeIds = targets.map((t) => t.dataset.id);
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
    setImageElements(Array.from(document.querySelectorAll(".target")));
    setElementGuidelines(Array.from(document.querySelectorAll(".target")));
  }, [images]);

  useEffect(() => {
    const updateGuidelines = () => {
      setVerticalGuidelines([0, containerRef.current!.offsetWidth]);
      setHorizontalGuidelines([0, containerRef.current!.offsetHeight]);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollRef.current!.scrollLeft += e.deltaY;
    };

    updateGuidelines();

    scrollRef.current!.addEventListener("wheel", onWheel, { passive: false });
    const resizeObserver = new ResizeObserver(updateGuidelines);
    resizeObserver.observe(containerRef.current!);
    return () => {
      resizeObserver.disconnect();
      scrollRef.current!.removeEventListener("wheel", onWheel);
    };
  }, []);

  const ButtonImg = ({ src }: { src: string }) => {
    return (
      <img
        draggable={false}
        className="w-10"
        src={src}
        onClick={() => {
          const id = idSequence.current;
          const createSeq = createSequence.current;
          setImages((prev) => [...prev, { id: id, src: src, style: { width: "40px", left: `${40 * createSeq}px` } }]);
          idSequence.current += 1;
          createSequence.current += 1;
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
            selectoRef.current?.clickTarget(e.inputEvent, e.inputTarget);
          }}
          onRender={(e) => {
            createSequence.current = 0;
            e.target.style.cssText += e.cssText;
          }}
          onRenderGroup={(e) => {
            createSequence.current = 0;
            e.events.forEach((ev) => {
              ev.target.style.cssText += ev.cssText;
            });
          }}
        />
        <Selecto
          ref={selectoRef}
          container={containerRef.current}
          selectableTargets={[".target"]}
          hitRate={0}
          selectByClick={true}
          selectFromInside={false}
          toggleContinueSelect={["shift"]}
          ratio={0}
          onDragStart={(e) => {
            const target = e.inputEvent.target;
            if (
              moveableRef.current?.isMoveableElement(target) ||
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
              moveableRef.current?.waitToChangeTarget().then(() => {
                moveableRef.current?.dragStart(e.inputEvent);
              });
            }
            setTargets(e.selected);
          }}
        />
        {images &&
          images.map((img) => {
            return (
              <img
                className={`absolute z-${img.id} target`}
                style={{ zIndex: img.id, ...img.style }}
                src={img.src}
                data-id={img.id}
                key={img.id}
                onDoubleClick={() => {
                  setImages((prev) => prev.filter((image) => image.id !== img.id));
                  setTargets([]);
                }}
              />
            );
          })}
      </div>
      <div ref={scrollRef} className="bg-gray-300 flex flex-cols w-screen overflow-auto gap-2 scrollbar pt-2 pb-1">
        {tiles.map((tile) => (
          <ButtonImg src={`${tile}`} key={tile} />
        ))}
      </div>
    </div>
  );
}
