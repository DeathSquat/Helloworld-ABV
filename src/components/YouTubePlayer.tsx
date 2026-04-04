import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Maximize2, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  description?: string;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  description,
  autoplay = false,
  showControls = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  const getEmbedUrl = () => {
    const baseUrl = 'https://www.youtube.com/embed/';
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      autohide: '1',
      showinfo: '0',
      controls: showControls ? '1' : '0',
      autoplay: autoplay ? '1' : '0',
      mute: autoplay ? '1' : '0',
      loop: '0',
      playlist: videoId
    });
    return `${baseUrl}${videoId}?${params.toString()}`;
  };

  const getThumbnailUrl = () => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="overflow-hidden bg-background border-border shadow-lg">
        <CardContent className="p-0">
          {/* Video Player Container */}
          <div 
            ref={playerRef}
            className="relative aspect-video bg-black rounded-lg overflow-hidden"
          >
            {/* YouTube Embed */}
            <iframe
              src={getEmbedUrl()}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {/* Custom Controls Overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-white" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                      YouTube
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openInYouTube}
                      className="text-white hover:bg-white/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Information */}
      {(title || description) && (
        <Card className="bg-background border-border">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  YouTube Video
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Embedded Player
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubePlayer;
