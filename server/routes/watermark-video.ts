import { RequestHandler } from "express";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { checkFFmpegAvailability } from "../utils/ffmpeg-check";

const WATERMARK_TEXT = "www.doxing.life";

export const handleWatermarkVideo: RequestHandler = async (req, res) => {
  try {
    // Check if FFmpeg is available
    if (!checkFFmpegAvailability()) {
      return res.status(503).json({
        error: "Video watermarking service unavailable",
        details:
          "FFmpeg is not installed on the server. Please contact the administrator to install FFmpeg.",
      });
    }

    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return res.status(400).json({ error: "Video URL is required" });
    }

    // Convert relative URLs to absolute URLs
    let absoluteUrl = videoUrl;

    // If URL is relative, make it absolute
    if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
      // Build the origin from the request
      const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
      const host = req.get("x-forwarded-host") || req.get("host") || "localhost";
      const origin = `${protocol}://${host}`;
      absoluteUrl = new URL(videoUrl, origin).toString();
    }

    // Validate URL to prevent SSRF attacks
    let urlObject;
    try {
      urlObject = new URL(absoluteUrl);
    } catch (error) {
      return res.status(400).json({ error: "Invalid video URL format" });
    }

    // Prevent SSRF by checking if it's a valid HTTP(S) URL
    if (!urlObject.protocol.startsWith("http")) {
      return res.status(400).json({ error: "Invalid video URL protocol" });
    }

    // Check if FFmpeg path is set
    const ffmpegPath = process.env.FFMPEG_PATH;
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }

    // Escape special characters in watermark text for FFmpeg
    const escapedText = WATERMARK_TEXT.replace(/'/g, "\\'");

    // Create watermark text overlay filter with diagonal text
    // The filter applies a semi-transparent white text rotated diagonally
    const watermarkFilter = `drawtext=text='${escapedText}':fontsize=60:fontcolor=white@0.6:x=(w-text_w)/2:y=(h-text_h)/2:angle=atan2(h\\,w)*180/PI:shadowx=2:shadowy=2:shadowcolor=black@0.5`;

    const passThrough = new PassThrough();
    let isProcessing = false;

    const command = ffmpeg()
      .input(videoUrl)
      .videoFilter(watermarkFilter)
      .audioCodec("aac")
      .videoCodec("libx264")
      .preset("medium")
      .format("mp4")
      .on("start", (commandLine) => {
        isProcessing = true;
        console.log("FFmpeg process started");
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Video processing failed",
            details:
              process.env.NODE_ENV === "development"
                ? err.message
                : "FFmpeg processing error",
          });
        }
      })
      .on("end", () => {
        console.log("Video watermarking completed successfully");
      })
      .pipe(passThrough, { end: true });

    // Set response headers
    res.set({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="video-watermarked.mp4"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Transfer-Encoding": "chunked",
    });

    passThrough.pipe(res);

    // Handle client disconnect
    res.on("close", () => {
      if (isProcessing) {
        console.log("Client disconnected, killing FFmpeg process");
        command.kill();
      }
    });
  } catch (error) {
    console.error("Watermark video error:", error);
    if (!res.headersSent) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Failed to process video",
        details:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Video processing error",
      });
    }
  }
};
