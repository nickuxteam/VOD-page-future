import { useEffect, useRef } from 'react';
import { DEVICES, DEVICE_FAMILIES, NO_SIMULATION, deviceLabel, findDevice } from '../simulation/devices';
import './ConfigPanel.css';

export interface ConfigPanelProps {
  open: boolean;
  onClose: () => void;
  /** Selected device id, or NO_SIMULATION. */
  deviceId: string;
  onDeviceChange: (id: string) => void;
}

/**
 * DEV TOOL — not part of the handover. Config panel (toggle with Q, as in
 * the prototype). Hosts the device simulation dropdown; defaults to
 * "No simulation".
 */
export function ConfigPanel({ open, onClose, deviceId, onDeviceChange }: ConfigPanelProps) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const device = findDevice(deviceId);

  useEffect(() => {
    if (open) selectRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="cfg-overlay" onClick={onClose}>
      <div className="cfg-card" role="dialog" aria-modal="true" aria-labelledby="cfg-title" onClick={(e) => e.stopPropagation()}>
        <div className="cfg-eyebrow">ITVX</div>
        <h2 className="cfg-title" id="cfg-title">Customise the VOD page</h2>

        <label className="cfg-row">
          <span className="cfg-label">Device simulation</span>
          <select
            ref={selectRef}
            className="cfg-select"
            value={deviceId}
            onChange={(e) => onDeviceChange(e.target.value)}
          >
            <option value={NO_SIMULATION}>No simulation</option>
            {DEVICE_FAMILIES.map((family) => (
              <optgroup key={family} label={family}>
                {DEVICES.filter((d) => d.family === family).map((d) => (
                  <option key={d.id} value={d.id}>{deviceLabel(d)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {device ? (
          <dl className="cfg-specs">
            <dt>SoC</dt><dd>{device.soc}</dd>
            <dt>CPU</dt><dd>{device.cpu}</dd>
            <dt>GPU</dt><dd>{device.gpu}</dd>
            <dt>RAM</dt><dd>{device.ramGB} GB</dd>
            <dt>Video</dt><dd>{device.video}</dd>
            <dt>OS</dt><dd>{device.os}</dd>
            <dt>Simulated</dt>
            <dd>
              ~{device.uiFps} fps UI · +{device.inputLatencyMs} ms remote lag
              {device.dropKeys ? ' · drops presses while busy' : ''} · {device.gpuTier}-end GPU effects
            </dd>
            {device.notes && (<><dt>Notes</dt><dd>{device.notes}</dd></>)}
          </dl>
        ) : (
          <p className="cfg-hint">Runs at full speed on this computer.</p>
        )}
        <p className="cfg-hint">
          Simulated figures are estimates from each device's hardware, not measurements. Check final
          performance on a real device.
        </p>

        <div className="cfg-actions">
          <button type="button" className="cfg-done" onClick={onClose}>Done</button>
        </div>
        <div className="cfg-keys"><kbd>Q</kbd> / <kbd>Esc</kbd> Close · <kbd>↑</kbd><kbd>↓</kbd> Change device</div>
      </div>
    </div>
  );
}
