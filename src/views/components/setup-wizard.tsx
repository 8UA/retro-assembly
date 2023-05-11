import { useEffect, useState } from 'react'
import { system } from '../../core'
import { Modal } from './modal'
import { GeneralSettings } from './settings-forms/general-settings'

function getCurrentGeneralSettings() {
  return {
    romProviderType: system.preference.get('romProviderType'),
    handle: undefined,
  }
}

export default function SetupWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const [generalSettings, setGeneralSettings] = useState(getCurrentGeneralSettings())

  async function checkNeedsSetup() {
    const isOpen = await system.needsSetup()
    setIsOpen(isOpen)
  }

  useEffect(() => {
    checkNeedsSetup()
  }, [])

  async function onChange(value) {
    const { romProviderType, handle, romDirectory } = value
    if (romProviderType !== generalSettings.romProviderType) {
      system.setFileSystemProviderType(romProviderType)
    }

    if (romProviderType === 'local') {
      await system.setLocalFileSystemHandle(handle)
      system.setWorkingDirectory('')
    } else if (romProviderType === 'onedrive') {
      system.setWorkingDirectory(romDirectory)
    }

    setGeneralSettings(getCurrentGeneralSettings())
    await checkNeedsSetup()
  }

  return (
    <Modal isOpen={isOpen}>
      <GeneralSettings value={generalSettings} onChange={onChange} />
    </Modal>
  )
}
