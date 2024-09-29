import useClipboard from './use-clipboard'

type Props = {
  fallbackCopy?: boolean
}

export default function useWebShare({ fallbackCopy = true }: Props = {}) {
  const isSupportWebShare = 'share' in navigator

  const defaultData = {
    title: process.env.SITE_NAME,
    text: process.env.SITE_NAME,
    url: window.location.href,
  }

  const { copy } = useClipboard()
  const share = async (data?: ShareData) => {
    const mergedData = {
      ...defaultData,
      ...data,
    }

    if (!isSupportWebShare && fallbackCopy) {
      await copy(mergedData.url)
      return
    }

    try {
      await navigator.share(mergedData)
    } catch (error) {}
  }

  return {
    isSupportWebShare,
    share,
  }
}
