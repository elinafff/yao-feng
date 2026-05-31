/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Check, ChevronRight } from 'lucide-react';
import { CHINA_REGIONS } from '../data';

interface RegionSelectorProps {
  onSelect: (province: string, city: string, district: string) => void;
  onClose: () => void;
  initialValue?: { province: string; city: string; district: string };
}

export default function RegionSelector({ onSelect, onClose, initialValue }: RegionSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>(initialValue?.province || '');
  const [selectedCity, setSelectedCity] = useState<string>(initialValue?.city || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialValue?.district || '');

  const getCities = () => {
    const prov = CHINA_REGIONS.provinces.find(p => p.name === selectedProvince);
    return prov ? prov.cities : [];
  };

  const getDistricts = () => {
    const prov = CHINA_REGIONS.provinces.find(p => p.name === selectedProvince);
    if (!prov) return [];
    const cityObj = prov.cities.find(c => c.name === selectedCity);
    return cityObj ? cityObj.districts : [];
  };

  const handleProvinceSelect = (pName: string) => {
    setSelectedProvince(pName);
    setSelectedCity('');
    setSelectedDistrict('');
  };

  const handleCitySelect = (cName: string) => {
    setSelectedCity(cName);
    setSelectedDistrict('');
  };

  const handleDistrictSelect = (dName: string) => {
    setSelectedDistrict(dName);
    onSelect(selectedProvince, selectedCity, dName);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900" id="region-selector-container">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <span className="font-semibold text-base text-slate-800">选择服务城市/区县</span>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors py-1 px-2 hover:bg-slate-100 rounded-md"
        >
          取消
        </button>
      </div>

      {/* Selected breadcrumbs */}
      <div className="bg-slate-100 px-4 py-3 text-xs flex flex-wrap gap-2 items-center text-slate-600 border-b border-slate-200">
        <span className="text-slate-400">当前选择:</span>
        <span className="bg-white px-2 py-1 rounded border border-slate-200 font-medium flex items-center gap-1">
          中国
        </span>
        {selectedProvince && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="bg-white px-2 py-1 rounded border border-rose-200 text-rose-600 font-medium active:scale-95 transition-transform">
              {selectedProvince}
            </span>
          </>
        )}
        {selectedCity && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="bg-white px-2 py-1 rounded border border-rose-200 text-rose-600 font-medium">
              {selectedCity}
            </span>
          </>
        )}
        {selectedDistrict && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="bg-rose-500 px-2 py-1 rounded text-white font-medium">
              {selectedDistrict}
            </span>
          </>
        )}
      </div>

      {/* Grid selector columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Prov list */}
        <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-white">
          <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white">
            省份/直辖市
          </div>
          {CHINA_REGIONS.provinces.map(p => (
            <button
              key={p.name}
              id={`prov-${p.name}`}
              onClick={() => handleProvinceSelect(p.name)}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-between ${
                selectedProvince === p.name
                  ? 'bg-rose-50 text-rose-600 font-semibold border-l-2 border-rose-500'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{p.name}</span>
              {selectedProvince === p.name && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        {/* City list */}
        <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50">
          <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50">
            市 / 地区
          </div>
          {!selectedProvince ? (
            <div className="p-3 text-center text-xs text-slate-400">请选择省份</div>
          ) : (
            getCities().map(c => (
              <button
                key={c.name}
                id={`city-${c.name}`}
                onClick={() => handleCitySelect(c.name)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCity === c.name
                    ? 'bg-white text-rose-600 font-semibold border-l-2 border-rose-500'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{c.name}</span>
                {selectedCity === c.name && <Check className="w-3.5 h-3.5" />}
              </button>
            ))
          )}
        </div>

        {/* District list */}
        <div className="w-1/3 overflow-y-auto bg-white">
          <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white">
            区 / 县
          </div>
          {!selectedCity ? (
            <div className="p-3 text-center text-xs text-slate-400">请选择城市</div>
          ) : (
            getDistricts().map(d => (
              <button
                key={d}
                id={`dist-${d}`}
                onClick={() => handleDistrictSelect(d)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedDistrict === d
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{d}</span>
                {selectedDistrict === d && <Check className="w-3.5 h-3.5" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
