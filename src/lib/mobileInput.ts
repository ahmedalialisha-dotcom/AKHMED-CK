export const sendMobileKey = (code: string, pressed: boolean) => {
  window.dispatchEvent(new KeyboardEvent(pressed ? "keydown" : "keyup", { code }));
};
