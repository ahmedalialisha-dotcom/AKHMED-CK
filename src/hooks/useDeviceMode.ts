import { useEffect, useState } from "react";

const detectsPhone = () =>
  window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 720;

export function useDeviceMode() {
  const [isPhone, setIsPhone] = useState(detectsPhone);

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: coarse)");
    const updateMode = () => setIsPhone(detectsPhone());
    pointer.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);
    return () => {
      pointer.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  return isPhone;
}
