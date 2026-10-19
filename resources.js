window.RESOURCES = [
  {
    id: "quran-text",
    file: "quran.json",              // file name inside assets/resources/<json|audio|images|pdfs>/
    title: "Quran JSON (Arabic text only)",
    kind: "json",                    // json | audio | pdf | image
    description: "114 surahs, ruku and juz mapping.",
    tags: ["JSON", "Quran", "Arabic", "Surahs"],
    size: "6690 kb"
  },
  {
    id: "quran-pages",
    kind: "gallery",                 // image set: pages are detected automatically
    folder: "quran-pages",           // assets/resources/images/<folder>/
    prefix: "page",                  // page001.png, page002.png, ...
    digits: 3,
    ext: "png",
    title: "Quran page images (Mushaf)",
    description: "Page-by-page images. Tap a page to open it full size.",
    tags: ["Images", "Quran", "Pages", "PNG"]
    // pages: 604                    // optional: set it to skip auto-detection
  },
];