import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      const native = Capacitor.isNativePlatform()
      setIsNative(native)

      if (native) {
        try {
          // Configurar status bar
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#2d5016' })
          
          // Forçar orientação paisagem
          await ScreenOrientation.lock({ orientation: ScreenOrientation.OrientationType.Landscape })
          
          // Esconder splash screen
          await SplashScreen.hide()
          
          // Configurar listeners do app
          App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive)
          })

          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp()
            } else {
              window.history.back()
            }
          })

        } catch (error) {
          console.error('Erro ao inicializar Capacitor:', error)
        }
      }
      
      setIsReady(true)
    }

    initializeApp()
  }, [])

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      try {
        await Haptics.impact({ style })
      } catch (error) {
        console.error('Erro no feedback háptico:', error)
      }
    }
  }

  const lockOrientation = async (orientation: any) => {
    if (isNative) {
      try {
        await ScreenOrientation.lock({ orientation })
      } catch (error) {
        console.error('Erro ao bloquear orientação:', error)
      }
    }
  }

  return {
    isNative,
    isReady,
    hapticFeedback,
    lockOrientation
  }
}