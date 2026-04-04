import React, { useState, useRef, useEffect } from 'react';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{time: number, text: string}>>([]);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(-1);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Mock transcript data - in real implementation, this would come from YouTube API or speech-to-text
  const generateTranscript = () => {
    const mockTranscript = [
      { time: 0, text: "Welcome to this comprehensive tutorial. In this video, we'll be covering fundamental concepts that you need to understand to get started with this topic." },
      { time: 30, text: "Let's begin by exploring the basic principles. Understanding these core concepts will provide you with a solid foundation for more advanced topics." },
      { time: 60, text: "As you can see from this example, the implementation follows a straightforward pattern. This approach ensures consistency and maintainability in your code." },
      { time: 90, text: "Now let's dive deeper into practical applications. We'll walk through several real-world scenarios to demonstrate how these concepts apply in practice." },
      { time: 120, text: "Here we can observe the interaction between different components. Notice how each element plays a specific role in the overall architecture." },
      { time: 150, text: "Let's take a moment to summarize what we've learned so far. These key takeaways will help you remember the most important points from this section." },
      { time: 180, text: "Moving forward, we'll explore advanced techniques that build upon the foundation we've established. These methods will help you tackle more complex challenges." },
      { time: 210, text: "Pay close attention to this next section as it contains crucial information that ties everything together. Understanding this connection is essential." },
      { time: 240, text: "Let's wrap up with some best practices and recommendations. Following these guidelines will help you avoid common pitfalls and improve your workflow." },
      { time: 270, text: "Thank you for watching this tutorial. I hope you found it helpful and informative. Don't forget to practice what you've learned today." }
    ];
    setTranscript(mockTranscript);
  };

  // YouTube API communication
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      if (event.data && typeof event.data === 'object') {
        if (event.data.event === 'infoDelivery') {
          if (event.data.info && event.data.info.currentTime) {
            setCurrentTime(event.data.info.currentTime);
          }
          if (event.data.info && event.data.info.duration) {
            setDuration(event.data.info.duration);
          }
        }
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, []);

  // Update current transcript based on video time
  useEffect(() => {
    const currentIndex = transcript.findIndex((item, index) => {
      const nextItem = transcript[index + 1];
      return currentTime >= item.time && (!nextItem || currentTime < nextItem.time);
    });
    
    if (currentIndex !== currentTranscriptIndex) {
      setCurrentTranscriptIndex(currentIndex);
    }
  }, [currentTime, transcript, currentTranscriptIndex]);

  // Generate transcript on mount
  useEffect(() => {
    generateTranscript();
  }, [videoId]);

  const sendCommandToPlayer = (command: string, args?: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        event: 'command',
        func: command,
        args: args || []
      }, 'https://www.youtube.com');
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player - Left Side (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden bg-background border-border shadow-lg">
            <CardContent className="p-0">
              {/* Video Player Container */}
              <div 
                ref={playerRef}
                className="relative aspect-video bg-black rounded-lg overflow-hidden max-h-80 sm:max-h-96 md:max-h-[32rem] lg:max-h-[36rem] xl:max-h-[40rem]"
              >
                {/* YouTube Embed */}
                <iframe
                  ref={iframeRef}
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
        </div>

        {/* Transcription Panel - Right Side (1 column) */}
        <div className="lg:col-span-1">
          <Card className="bg-background border-border shadow-lg h-full">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Transcription</h3>
                  <Badge variant="outline" className="text-xs">
                    Auto-generated
                  </Badge>
                </div>
                
                {/* Transcription Content */}
                <div className="space-y-3 max-h-[32rem] lg:max-h-[36rem] xl:max-h-[40rem] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      {transcript.map((segment, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            index === currentTranscriptIndex 
                              ? 'bg-primary/20 border-primary' 
                              : 'bg-muted/50 border-border hover:bg-muted'
                          }`}
                          onClick={() => {
                            // Seek to specific time when clicking transcript segment
                            sendCommandToPlayer('seekTo', [segment.time]);
                          }}
                        >
                          <p className="font-medium text-muted-foreground mb-1">
                            {formatTime(segment.time)}
                          </p>
                          <p className="text-foreground leading-relaxed">
                            {segment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Transcription Controls */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="text-xs">
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Search
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
