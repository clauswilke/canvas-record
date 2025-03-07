const isWebCodecsSupported =
  typeof window !== "undefined" && typeof window.VideoEncoder === "function";

let link;

const downloadBlob = (filename, blobPart, mimeType) => {
  link ||= document.createElement("a");
  link.download = filename;

  const blob = new Blob(blobPart, { type: mimeType });
  const url = URL.createObjectURL(blob);
  link.href = url;

  const event = new MouseEvent("click");
  link.dispatchEvent(event);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1);
};

const formatDate = (date) =>
  date.toISOString().replace(/:/g, "-").replace("T", "@").replace("Z", "");

const formatSeconds = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds - minutes * 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const nextMultiple = (x, n = 2) => Math.ceil(x / n) * n;

class Deferred {
  constructor() {
    this.resolve = null;
    this.reject = null;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    Object.freeze(this);
  }
}

export {
  isWebCodecsSupported,
  downloadBlob,
  formatDate,
  formatSeconds,
  nextMultiple,
  Deferred,
};
