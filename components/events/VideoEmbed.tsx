'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedSrc: string; thumbSrc?: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      type: 'youtube',
      embedSrc: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`,
      thumbSrc: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    }
  }

  // Direct video file
  return { type: 'direct', embedSrc: url }
}

interface VideoEmbedProps {
  url: string
  title?: string
}

export default function VideoEmbed({ url, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const { type, embedSrc, thumbSrc } = parseVideoUrl(url)

  if (type === 'direct') {
    return (
      <video
        src={embedSrc}
        controls
        playsInline
        className="w-full rounded-2xl aspect-video bg-black"
        aria-label={title ?? 'Event video'}
      />
    )
  }

  // YouTube / Vimeo — lazy-load with thumbnail poster
  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        aria-label={`Play ${title ?? 'event video'}`}
      >
        {thumbSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbSrc} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
        )}
        {!thumbSrc && <div className="absolute inset-0 bg-surface-2" />}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-brand-gold/90 group-hover:bg-brand-gold flex items-center justify-center transition shadow-gold">
            <Play className="w-7 h-7 text-black fill-black ml-0.5" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe
        src={embedSrc}
        title={title ?? 'Event video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
