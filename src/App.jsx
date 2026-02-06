import { useEffect, useState } from 'react'
import PackageCollector from './PackageCollector'
import ProcessingDesk from './ProcessingDesk'

function PackageDetailsModal({ pkg, onClose, onUpdate, onSend }) {
  const [fragile, setFragile] = useState(pkg.fragile || false);

  function handleToggleFragile() {
    setFragile(!fragile);
    onUpdate({ ...pkg, fragile: !fragile });
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: 20, borderRadius: 8,
        width: 300, boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <h3>package details</h3>
        <p><b>destination:</b> {pkg.destination}</p>
        <p><b>fragile:</b> {fragile ? 'yes' : 'no'}</p>
        <button onClick={handleToggleFragile}>
          {fragile ? 'remove fragile sticker' : 'add fragile sticker'}
        </button>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between'}}>
          <button onClick={onClose}>cancel</button>
          <button onClick={() => onSend({ ...pkg, fragile })}>send to processing</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageToProcess, setPackageToProcess] = useState(null);

  const [packageData, setPackageData] = useState(null);

  function handlePackageClick(pkg) {
    setSelectedPackage(pkg);
    setPackageData(pkg);
  }

  function handleUpdate(updatedPkg) {
    setPackageData(updatedPkg);
  }

  function handleSendToProcessing(pkg) {
    setPackageToProcess(pkg);
    setSelectedPackage(null);
  }

  function handleProcessingDone() {
    setPackageToProcess(null);
  }

  return (
    <>
      <PackageCollector onSelectPackage={handlePackageClick} />

      {selectedPackage && (
        <PackageDetailsModal
          pkg={packageData}
          onClose={() => setSelectedPackage(null)}
          onUpdate={handleUpdate}
          onSend={handleSendToProcessing}
        />
      )}

      {packageToProcess && (
        <ProcessingDesk
          pkg={packageToProcess}
          onDone={handleProcessingDone}
        />
      )}
    </>
  )
}