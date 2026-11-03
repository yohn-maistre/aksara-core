; Stop through the existing authenticated control channel before replacing files.
; User data and credentials are outside INSTDIR and are never removed here.
!macro NSIS_HOOK_PREINSTALL
  IfFileExists "$INSTDIR\aksara-desktop.exe" 0 aksara_preinstall_done
    ExecWait '"$INSTDIR\aksara-desktop.exe" --stop-host' $0
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONEXCLAMATION "Please stop Aksara from its tray menu before updating. Your data has not been removed."
      Abort
    ${EndIf}
  aksara_preinstall_done:
!macroend
!macro NSIS_HOOK_PREUNINSTALL
  IfFileExists "$INSTDIR\aksara-desktop.exe" 0 aksara_preuninstall_done
    ExecWait '"$INSTDIR\aksara-desktop.exe" --stop-host' $0
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONEXCLAMATION "Please stop Aksara from its tray menu before uninstalling. Your data has not been removed."
      Abort
    ${EndIf}
  aksara_preuninstall_done:
!macroend
