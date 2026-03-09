// src/utils/fetchBlog.js
// Dipanggil saat build time di halaman utama.
// Fetch JSON feed dari Blogger ragamtutorial.web.id

const FEED_URL =
  "https://ragamtutorial.web.id/feeds/posts/default?alt=json&max-results=3";

/**
 * Ekstrak URL gambar pertama dari string HTML konten artikel.
 * @param {string} html
 * @returns {string} URL gambar atau string kosong
 */
function extractThumbnail(html) {
  if (!html) return "";
  // Cari src="..." atau src='...' dalam tag <img>
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return "";
  let url = match[1];
  // Blogger kadang menyertakan versi kecil (w640-h350), kita ambil versi lebih besar
  // Hapus size parameter untuk mendapatkan original atau ukuran lebih besar
  url = url.replace(/\/w\d+-h\d+\//, "/w800-h450/");
  return url;
}

/**
 * Ambil maksimal 3 artikel terbaru dari Blogger JSON feed.
 * @returns {Promise<Array<{judul: string, tanggal: string, ringkasan: string, link: string, thumbnail: string}>>}
 */
export async function fetchBlog() {
  try {
    const response = await fetch(FEED_URL);
    if (!response.ok) {
      console.warn(`[fetchBlog] Feed error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const entries = data?.feed?.entry ?? [];

    return entries.slice(0, 3).map((entry) => {
      // Judul
      const judul = entry.title?.$t ?? "Tanpa Judul";

      // Tanggal dipublish
      const rawDate = entry.published?.$t ?? "";
      const tanggal = rawDate
        ? new Date(rawDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      // Konten mentah (HTML) — digunakan untuk ekstrak thumbnail dan ringkasan
      const rawHtml = entry.content?.$t || entry.summary?.$t || "";

      // Thumbnail: ambil gambar pertama dari konten HTML artikel
      const thumbnail = extractThumbnail(rawHtml);

      // Ringkasan: strip HTML, potong 40 kata
      const plainText = rawHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const words = plainText.split(" ");
      const ringkasan =
        words.length > 40 ? words.slice(0, 40).join(" ") + "..." : plainText;

      // Link ke artikel asli
      const linkObj = (entry.link ?? []).find((l) => l.rel === "alternate");
      const link = linkObj?.href ?? "https://ragamtutorial.web.id";

      return { judul, tanggal, ringkasan, link, thumbnail };
    });
  } catch (err) {
    console.warn("[fetchBlog] Gagal fetch feed:", err.message);
    return [];
  }
}
