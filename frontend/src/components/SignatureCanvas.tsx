import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

export interface SignatureCanvasHandle {
  getSignatureBase64: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface SignatureCanvasProps {
  onSignatureChange?: (isEmpty: boolean) => void;
  className?: string;
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  ({ onSignatureChange, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const hasDrawn = useRef(false);

    const getCtx = () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      return ctx;
    };

    const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      e.preventDefault();
      isDrawing.current = true;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }, []);

    const draw = useCallback((e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      e.preventDefault();
      const pos = getPos(e, canvas);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (!hasDrawn.current) {
        hasDrawn.current = true;
        onSignatureChange?.(false);
      }
    }, [onSignatureChange]);

    const stopDrawing = useCallback(() => {
      isDrawing.current = false;
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
      };
    }, [startDrawing, draw, stopDrawing]);

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn.current = false;
      onSignatureChange?.(true);
    }, [onSignatureChange]);

    useImperativeHandle(ref, () => ({
      getSignatureBase64: () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn.current) return null;
        return canvas.toDataURL('image/png');
      },
      clear,
      isEmpty: () => !hasDrawn.current,
    }));

    return (
      <div className={`flex flex-col gap-2 ${className ?? ''}`}>
        <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={150}
            className="w-full h-36 cursor-crosshair touch-none"
            style={{ display: 'block' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Assine acima usando o mouse ou toque na tela
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clear}
            className="gap-1"
          >
            <Eraser className="h-3 w-3" />
            Limpar
          </Button>
        </div>
      </div>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';

export default SignatureCanvas;
