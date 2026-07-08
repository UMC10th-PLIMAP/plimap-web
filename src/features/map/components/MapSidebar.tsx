import React, { useState } from 'react';
import { ColorSettings, ToggleSettings, MapSize, MAP_SIZE_PRESETS } from '../types';
import { generateMapStyles } from '../utils';

type MapSidebarProps = {
  isDarkMode: boolean;
  colors: ColorSettings;
  toggles: ToggleSettings;
  zoom: number;
  mapSize: MapSize;
  onToggleDarkMode: () => void;
  onColorChange: (key: keyof ColorSettings, value: string) => void;
  onToggleChange: (key: keyof ToggleSettings) => void;
  onZoomChange: (zoom: number) => void;
  onMapSizeChange: (size: MapSize) => void;
};

// --- 토글 스위치 공통 UI 컴포넌트 ---
const ToggleRow = ({
  label,
  value,
  onChange,
  isDark,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
  isDark: boolean;
}) => (
  <div
    className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-[#1A1C1E]' : 'bg-white shadow-sm'}`}
  >
    <span className={`text-sm ${isDark ? 'text-[#EFEFEF]' : 'text-gray-800'}`}>{label}</span>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        value ? 'bg-blue-500' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const MapSidebar: React.FC<MapSidebarProps> = ({
  isDarkMode,
  colors,
  toggles,
  zoom,
  mapSize,
  onToggleDarkMode,
  onColorChange,
  onToggleChange,
  onZoomChange,
  onMapSizeChange,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = () => {
    const styles = generateMapStyles(colors, toggles);
    navigator.clipboard
      .writeText(JSON.stringify(styles, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error('클립보드 복사 실패:', err));
  };

  const bgClass = isDarkMode ? 'bg-[#0C0D0F]' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-[#EFEFEF]' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-[#1A1C1E]' : 'border-gray-200';
  const sectionTitleClass = isDarkMode ? 'text-[#9A9A9A]' : 'text-gray-500';

  return (
    <aside
      className={`w-[300px] h-full flex-shrink-0 ${bgClass} border-r ${borderClass} flex flex-col p-5 overflow-y-auto scrollbar-hide`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-xl font-bold ${textClass}`}>Plimap Demo</h1>
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-[#1A1C1E] text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
          title="Toggle Theme"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>

      {/* --- 배율 (Zoom) 설정 --- */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center mb-1">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${sectionTitleClass}`}>
            Zoom Level
          </h2>
          <span className={`text-sm font-mono ${textClass}`}>{zoom}</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* --- 지도 크기 (Map Size) 설정 --- */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between items-center mb-1">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${sectionTitleClass}`}>
            지도 크기
          </h2>
          <span className={`text-xs font-mono ${sectionTitleClass}`}>
            {mapSize.width} × {mapSize.height}
          </span>
        </div>

        <div className="flex gap-2">
          {MAP_SIZE_PRESETS.map((preset) => {
            const isActive =
              mapSize.width === preset.size.width && mapSize.height === preset.size.height;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onMapSizeChange(preset.size)}
                className={`flex-1 text-xs py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-[#1A1C1E] text-[#9A9A9A] hover:bg-[#24272b]'
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <label
            className={`flex-1 flex flex-col gap-1 p-3 rounded-lg ${isDarkMode ? 'bg-[#1A1C1E]' : 'bg-white shadow-sm'}`}
          >
            <span className={`text-xs ${sectionTitleClass}`}>너비 (px)</span>
            <input
              type="number"
              min={200}
              max={2000}
              value={mapSize.width}
              onChange={(e) => onMapSizeChange({ ...mapSize, width: Number(e.target.value) })}
              className={`bg-transparent text-sm font-mono outline-none ${textClass}`}
            />
          </label>
          <label
            className={`flex-1 flex flex-col gap-1 p-3 rounded-lg ${isDarkMode ? 'bg-[#1A1C1E]' : 'bg-white shadow-sm'}`}
          >
            <span className={`text-xs ${sectionTitleClass}`}>높이 (px)</span>
            <input
              type="number"
              min={200}
              max={2000}
              value={mapSize.height}
              onChange={(e) => onMapSizeChange({ ...mapSize, height: Number(e.target.value) })}
              className={`bg-transparent text-sm font-mono outline-none ${textClass}`}
            />
          </label>
        </div>
      </div>

      {/* --- 색상 (Colors) 설정 --- */}
      <div className="flex flex-col gap-4 mb-8">
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${sectionTitleClass}`}>
          Colors
        </h2>
        {Object.entries(colors).map(([key, value]) => (
          <div
            key={key}
            className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-[#1A1C1E]' : 'bg-white shadow-sm'}`}
          >
            <label htmlFor={key} className={`text-sm capitalize ${textClass}`}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono w-16 text-right ${sectionTitleClass}`}>
                {value}
              </span>
              <input
                id={key}
                type="color"
                value={value}
                onChange={(e) => onColorChange(key as keyof ColorSettings, e.target.value)}
                className="w-6 h-6 border-0 p-0 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- 요소 토글 설정 --- */}
      <div className="flex flex-col gap-6 mb-8">
        {/* 1. 라벨 및 경계 */}
        <div>
          <h2
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${sectionTitleClass}`}
          >
            Labels & Borders
          </h2>
          <div className="flex flex-col gap-2">
            <ToggleRow
              label="모든 글씨 라벨"
              value={toggles.allLabels}
              onChange={() => onToggleChange('allLabels')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="행정구역/국경선"
              value={toggles.administrative}
              onChange={() => onToggleChange('administrative')}
              isDark={isDarkMode}
            />
          </div>
        </div>

        {/* 2. 지형 및 건물 */}
        <div>
          <h2
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${sectionTitleClass}`}
          >
            Landscape
          </h2>
          <div className="flex flex-col gap-2">
            <ToggleRow
              label="건물 및 인공물"
              value={toggles.landscapeManMade}
              onChange={() => onToggleChange('landscapeManMade')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="자연 지형 (산/숲)"
              value={toggles.landscapeNatural}
              onChange={() => onToggleChange('landscapeNatural')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="물 (강/바다)"
              value={toggles.water}
              onChange={() => onToggleChange('water')}
              isDark={isDarkMode}
            />
          </div>
        </div>

        {/* 3. 도로 및 대중교통 */}
        <div>
          <h2
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${sectionTitleClass}`}
          >
            Roads & Transit
          </h2>
          <div className="flex flex-col gap-2">
            <ToggleRow
              label="고속도로"
              value={toggles.roadHighway}
              onChange={() => onToggleChange('roadHighway')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="간선도로"
              value={toggles.roadArterial}
              onChange={() => onToggleChange('roadArterial')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="일반도로"
              value={toggles.roadLocal}
              onChange={() => onToggleChange('roadLocal')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="대중교통 노선"
              value={toggles.transitLine}
              onChange={() => onToggleChange('transitLine')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="대중교통 역"
              value={toggles.transitStation}
              onChange={() => onToggleChange('transitStation')}
              isDark={isDarkMode}
            />
          </div>
        </div>

        {/* 4. 관심 지점 (POI) */}
        <div>
          <h2
            className={`text-sm font-semibold uppercase tracking-wider mb-3 ${sectionTitleClass}`}
          >
            Points of Interest (POI)
          </h2>
          <div className="flex flex-col gap-2">
            <ToggleRow
              label="상업 시설"
              value={toggles.poiBusiness}
              onChange={() => onToggleChange('poiBusiness')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="관광 명소"
              value={toggles.poiAttraction}
              onChange={() => onToggleChange('poiAttraction')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="의료 시설"
              value={toggles.poiMedical}
              onChange={() => onToggleChange('poiMedical')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="공원"
              value={toggles.poiPark}
              onChange={() => onToggleChange('poiPark')}
              isDark={isDarkMode}
            />
            <ToggleRow
              label="학교"
              value={toggles.poiSchool}
              onChange={() => onToggleChange('poiSchool')}
              isDark={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* --- 코드 복사 --- */}
      <div className="mt-auto pt-4 pb-4">
        <button
          onClick={handleCopyCode}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
        >
          {copySuccess ? '복사 완료' : 'Styles 코드 복사'}
        </button>
      </div>
    </aside>
  );
};
