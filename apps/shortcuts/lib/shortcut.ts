type Type = 'STRING' | 'NUMBER_INT64' | 'STRING_LIST' | 'TIMESTAMP' | 'ASSETID'

type BaseFields = {
  name: {
    type: Type
    value: string
  }
  shortcut: {
    value: {
      fileChecksum: string
      downloadURL: string
      size: number
    }
    type: Type
  }
  icon_color: {
    /** 图标颜色 */
    value: number
    type: Type
  }
  icon_glyph: {
    value: number
    type: Type
  }
}

interface SharedShortcutFields extends BaseFields {
  /** 恶意扫描内容版本 */
  maliciousScanningContentVersion: {
    type: Type
    value: number
  }
  icon: {
    value: {
      downloadURL: string
      size: number
      fileChecksum: string
    }
    type: Type
  }
  signingCertificateExpirationDate: {
    type: Type
    value: number
  }
  signingStatus: {
    type: Type
    value: string
  }
  signedShortcut: {
    type: Type
    value: {
      fileChecksum: string
      size: number
      downloadURL: string
    }
  }
}

interface GalleryShortcutFields extends BaseFields {
  icon_glyph: { type: Type; value: number }
  language: {
    /** 'zh_CN' | 'en' */
    value: string
    type: Type
  }
  longDescription: {
    type: Type
    value: string
  }
  minVersion: { type: Type; value: number }
  persistentIdentifier: {
    value: string
    type: Type
  }
  searchable: { value: number; type: Type }
  shortDescription: { value: string; type: Type }
  supportedIdioms: {
    type: Type
    /** "Desktop", "Pad", "Pod", "Phone", "Watch" */
    value: string[]
  }
}

export const enum RecordType {
  GalleryShortcut = 'GalleryShortcut',
  SharedShortcut = 'SharedShortcut',
}
export type ShortcutRecord = {
  [Type in RecordType]: {
    created: {
      userRecordName: string
      timestamp: number
      deviceID: string
    }
    deleted: boolean
    modified: {
      deviceID: string
      userRecordName: string
      timestamp: number
    }
    pluginFields: object
    recordChangeTag: string
    recordName: string
    recordType: Type
    fields: {
      [RecordType.GalleryShortcut]: GalleryShortcutFields
      [RecordType.SharedShortcut]: SharedShortcutFields
    }[Type]
  }
}[RecordType]
