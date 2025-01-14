class Encoder {
  static supportedExtensions = ["mp4", "webm"];
  static supportedTargets = ["in-browser"]; // or "file-system"

  static defaultOptions = {
    frameMethod: "blob",
    extension: Encoder.supportedExtensions[0],
    target: Encoder.supportedTargets[0],
  };

  constructor(options) {
    Object.assign(this, options);
  }

  async init(options) {
    Object.assign(this, options);
  }

  // File System API
  async getDirectory() {
    if (!("showDirectoryPicker" in window)) return;
    return await window.showDirectoryPicker();
  }

  async getDirectoryHandle(directory, name) {
    return await directory.getDirectoryHandle(name, { create: true });
  }

  async getFileHandle(name, options) {
    if (this.directoryHandle) {
      return await this.directoryHandle.getFileHandle(name, { create: true });
    }

    if (!("showSaveFilePicker" in window)) return;

    return await window.showSaveFilePicker({
      suggestedName: name,
      ...options,
    });
  }

  async getWritableFileStream(fileHandle) {
    if (
      (await fileHandle.queryPermission({ mode: "readwrite" })) === "granted"
    ) {
      return await fileHandle.createWritable();
    }
  }

  // Override methods
  /**
   * @param {number} frame
   * @param {number} frameNumber
   */
  async encode() {}
  async stop() {}
  dispose() {}
}

export default Encoder;
