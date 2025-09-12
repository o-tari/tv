export declare namespace WebTorrent {
  interface TorrentFile {
    name: string
    length: number
    path: string
    appendTo(element: HTMLElement): void
  }

  interface Torrent {
    name: string
    length: number
    files: TorrentFile[]
    infoHash: string
    on(event: string, listener: (...args: any[]) => void): void
    destroy(): void
  }

  interface Instance {
    add(magnet: string, callback?: (torrent: Torrent) => void): Torrent
    destroy(): void
  }

  interface WebTorrentConstructor {
    new (): Instance
  }
}

export declare const WebTorrent: WebTorrent.WebTorrentConstructor
