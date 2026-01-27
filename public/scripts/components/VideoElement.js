import { Element } from './Element.js';

/**
 * VideoElement - Video element component (supports YouTube and direct video URLs)
 */
export class VideoElement extends Element {
  constructor(data) {
    super({ ...data, type: 'video' });
    this.videoElement = null;
    this.isYouTube = false;
    this.videoId = null;
  }

  /**
   * Parse YouTube URL and extract video ID
   * @param {string} url
   * @returns {string|null}
   */
  parseYouTubeUrl(url) {
    const youtubeRegex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  }

  /**
   * Check if URL is a YouTube video
   * @param {string} url
   * @returns {boolean}
   */
  isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  /**
   * Create the video element
   * @param {boolean} autoplay
   * @returns {HTMLElement}
   */
  createElement(autoplay = false) {
    const el = super.createElement();

    if (this.isYouTubeUrl(this.content)) {
      this.isYouTube = true;
      this.videoId = this.parseYouTubeUrl(this.content);

      if (this.videoId) {
        const iframe = document.createElement('iframe');
        iframe.id = `yt-player-${this.videoId}`;
        iframe.src = `https://www.youtube.com/embed/${this.videoId}?autoplay=${autoplay ? 1 : 0}&controls=1&muted=1`;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        this.videoElement = iframe;
        el.appendChild(iframe);
      }
    } else {
      const video = document.createElement('video');
      video.src = this.content;
      video.controls = true;
      video.style.width = '100%';
      video.style.height = '100%';

      if (autoplay) {
        video.autoplay = true;
        video.muted = true;
      }

      this.videoElement = video;
      el.appendChild(video);
    }

    return el;
  }

  /**
   * Play the video
   */
  play() {
    if (!this.videoElement) return;

    if (this.isYouTube) {
      // YouTube API play - requires YouTube IFrame API
      if (window.YT && window.YT.Player) {
        const player = new window.YT.Player(this.videoElement.id);
        if (player && player.playVideo) {
          player.playVideo();
        }
      }
    } else {
      this.videoElement.play();
    }
  }

  /**
   * Pause the video
   */
  pause() {
    if (!this.videoElement) return;

    if (this.isYouTube) {
      // YouTube API pause
      if (window.YT && window.YT.Player) {
        const player = new window.YT.Player(this.videoElement.id);
        if (player && player.pauseVideo) {
          player.pauseVideo();
        }
      }
    } else {
      this.videoElement.pause();
    }
  }
}
