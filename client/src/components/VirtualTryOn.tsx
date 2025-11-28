import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VirtualTryOnProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  productName: string
}

export default function VirtualTryOn({ isOpen, onClose, imageUrl, productName }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(100)
  const [opacity, setOpacity] = useState(85)
  const [cameraActive, setCameraActive] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }
      } catch {}
    })()
    return () => {
      if (videoRef.current) {
        const s = videoRef.current.srcObject as MediaStream | null
        s?.getTracks().forEach(t => t.stop())
      }
      setCameraActive(false)
    }
  }, [isOpen])

  const capture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!video || !canvas || !overlay) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const w = (overlay.naturalWidth * scale) / 100
    const h = (overlay.naturalHeight * scale) / 100
    const x = (canvas.width - w) / 2
    const y = (canvas.height - h) / 2
    ctx.globalAlpha = Math.min(1, Math.max(0, opacity / 100))
    ctx.drawImage(overlay, x, y, w, h)
    ctx.globalAlpha = 1
  }

  const shareImage = async () => {
    setSharing(true)
    await capture()
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/jpeg'))
      if (!blob) return
      const file = new File([blob], `${productName}-tryon.jpg`, { type: 'image/jpeg' })
      if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: `${productName} try-on` })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${productName}-tryon.jpg`
        a.click()
        URL.revokeObjectURL(a.href)
      }
    } finally { setSharing(false) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Virtual Try-On</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-black/5" />
            <canvas ref={canvasRef} className="w-full rounded border" />
            <p className="text-xs text-muted-foreground">Camera feed remains local and is not uploaded.</p>
          </div>
          <div className="space-y-4">
            <div className="aspect-square border rounded flex items-center justify-center bg-muted">
              <img ref={overlayRef} src={imageUrl} alt={productName} className="max-w-full max-h-full" style={{ opacity: opacity/100, transform: `scale(${scale/100})` }} />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Size</p>
                <Slider value={[scale]} onValueChange={(v)=>setScale(v[0])} min={50} max={200} step={1} />
              </div>
              <div>
                <p className="text-sm font-medium">Opacity</p>
                <Slider value={[opacity]} onValueChange={(v)=>setOpacity(v[0])} min={30} max={100} step={1} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={shareImage} disabled={sharing || !cameraActive}>{sharing ? 'Preparing...' : 'Share Snapshot'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
