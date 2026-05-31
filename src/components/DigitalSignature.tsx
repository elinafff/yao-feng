/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Check, PenTool } from 'lucide-react';

interface DigitalSignatureProps {
  onSignComplete: (signatureImageUrlOrData: string) => void;
  defaultName?: string;
}

export default function DigitalSignature({ onSignComplete, defaultName = '' }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState(defaultName);
  const [activeTab, setActiveTab] = useState<'draw' | 'type'>('draw');

  // Load cursive styling
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Zhi+Mang+Xing&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#020617'; // slate-950
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('请先绘制您的个人手写签名！');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      onSignComplete(dataUrl);
    } else {
      if (!typedName.trim()) {
        alert('请先输入您的真实姓名以进行智能草书代签！');
        return;
      }
      onSignComplete(`TYPED:${typedName}`);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-4 gap-4 shadow-inner" id="digital-signature-box">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
          <PenTool className="w-4 h-4 text-emerald-500" />
          <span>选择签名签署方式</span>
        </div>
        <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'draw' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            }`}
          >
            画布手写
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'type' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            }`}
          >
            姓名生成
          </button>
        </div>
      </div>

      {activeTab === 'draw' ? (
        <div className="flex flex-col gap-2">
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white h-36 flex items-center justify-center cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={340}
              height={144}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute top-0 left-0 w-full h-full touch-none"
            />
            {!hasDrawn && (
              <span className="text-xs text-slate-400 select-none pointer-events-none z-0">
                请在此虚线区域内手写绘制您的姓名
              </span>
            )}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>支持移动端手指触控/PC端鼠标拖拽</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-red-500 font-semibold flex items-center gap-1 hover:text-red-700 active:scale-95 transition-transform"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空画板</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400">输入真实法言姓名</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="请输入您的真实姓名"
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <div className="border border-slate-200 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 h-24 flex items-center justify-center relative shadow-sm">
            <span className="absolute top-1.5 left-1.5 text-[9px] text-amber-500 bg-amber-100 rounded px-1.5 font-bold">
              中国CA区块链防伪草书体签名样式
            </span>
            {typedName ? (
              <span className="text-3xl text-slate-900 font-medium font-serif select-none tracking-widest" style={{ fontFamily: '"Zhi Mang Xing", "Caveat", cursive' }}>
                {typedName}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">预览区将实时渲染艺术草书签名...</span>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
      >
        <Check className="w-4 h-4" />
        <span>确认并锁定电子签名</span>
      </button>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        数字签名系通过AES非对称加密技术存储，视为对本领养协议具有同等法律效力。
      </p>
    </div>
  );
}
