import { RequestHandler } from "express";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import path from "path";

const WATERMARK_TEXT = "www.doxing.life";

export const handleWatermarkVideo: RequestHandler = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return res.status(400).json({ error: "Video URL is required" });
    }

    // Validate URL to prevent SSRF attacks
    try {
      new URL(videoUrl);
    } catch {
      return res.status(400).json({ error: "Invalid video URL" });
    }

    // Check if FFmpeg is available
    const ffmpegPath = process.env.FFMPEG_PATH;
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }

    // Create watermark text overlay filter
    // This will add diagonal watermark text across the video
    const watermarkFilter = `drawtext=text='${WATERMARK_TEXT}':fontsize=60:fontcolor=white@0.6:x=(w-text_w)/2:y=(h-text_h)/2:rotation=atan2(h\\,w):shadowx=2:shadowy=2:shadowcolor=black@0.5`;

    const passThrough = new PassThrough();

    ffmpeg()
      .input(videoUrl)
      .videoFilter(watermarkFilter)
      .audioCodec("aac")
      .videoCodec("libx264")
      .format("mp4")
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Video processing failed",
            details:
              process.env.NODE_ENV === "development" ? err.message : undefined,
          });
        }
      })
      .on("end", () => {
        console.log("Video watermarking completed");
      })
      .pipe(passThrough, { end: true });

    // Set response headers
    res.set({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="video-watermarked.mp4"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });

    passThrough.pipe(res);
  } catch (error) {
    console.error("Watermark video error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to process video",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }
};
