import { ref, watch } from 'vue'

export const eventBus = {
  emitter: ref(new Map()),
  emit(event, data) {
    this.emitter.value.set(event, data)
  },
  on(event, callback) {
    watch(
      () => this.emitter.value.get(event),
      (newValue) => {
        if (newValue !== undefined) {
          callback(newValue)
          this.emitter.value.delete(event)
        }
      }
    )
  }
}