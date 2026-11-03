; Keep executable files separate from the existing %LOCALAPPDATA%\Aksara data.
; Tauri's stock current-user default otherwise collides with that directory.
!define MUI_CUSTOMFUNCTION_GUIINIT AksaraInstallDirectory
Function AksaraInstallDirectory
  ${If} $INSTDIR == "$LOCALAPPDATA\Aksara"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\Aksara"
  ${EndIf}
FunctionEnd

; Stop through the existing authenticated control channel before replacing files.
; User data and credentials are outside INSTDIR and are never removed here.
!macro NSIS_HOOK_PREINSTALL
  ; Silent installs do not run GUI initialization. Preserve explicit /D paths.
  ${If} $INSTDIR == "$LOCALAPPDATA\Aksara"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\Aksara"
    SetOutPath $INSTDIR
  ${EndIf}
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
