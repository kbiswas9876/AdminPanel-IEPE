// Editor instance manager to prevent plugin conflicts
class EditorManager {
  private static instance: EditorManager
  private editorCount = 0
  private editors: Map<string, unknown> = new Map()

  static getInstance(): EditorManager {
    if (!EditorManager.instance) {
      EditorManager.instance = new EditorManager()
    }
    return EditorManager.instance
  }

  generateEditorKey(): string {
    this.editorCount++
    return `editor-${this.editorCount}-${Date.now()}`
  }

  registerEditor(key: string, editor: unknown): void {
    this.editors.set(key, editor)
  }

  unregisterEditor(key: string): void {
    const editor = this.editors.get(key)
    if (editor && typeof editor === 'object' && editor !== null && 'destroy' in editor) {
      (editor as { destroy: () => void }).destroy()
      this.editors.delete(key)
    }
  }

  cleanup(): void {
    this.editors.forEach((editor) => {
      if (editor && typeof editor === 'object' && editor !== null && 'destroy' in editor) {
        (editor as { destroy: () => void }).destroy()
      }
    })
    this.editors.clear()
  }
}

export const editorManager = EditorManager.getInstance()
