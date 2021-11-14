<template>
  <div style="display: flex; align-items: center" @click="play">
    <div style="font-size: 12px;">{{ duration }}</div>
    <div class="waveformOuter">
      <div id="waveform" ref="waveform" :style="{ width: containerWidth + 'px' }" />
    </div>
  </div>
</template>

<script>
import WaveSurfer from 'wavesurfer.js'
import { BASE_AUDIO_URL } from '@/config/constant'

export default {
  data () {
    return {
      wavesurfer: null,
      containerWidth: 0,
      duration: 0,
      BASE_AUDIO_URL
    }
  },
  props: {
    url: {
      type: String
    }
  },
  mounted () {
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      waveColor: '#000',
      progressColor: '#999',
      barWidth: 3,
      barHeight: 3,
      height: 20,
      barGap: 3,
      hideCursor: true,
      cursorWidth: 0,
      interact: false
    })
    this.wavesurfer.load(BASE_AUDIO_URL + this.url)
    this.wavesurfer.on('ready', () => {
      let nowWidth = window.getComputedStyle(this.$refs.waveform).width
      nowWidth = nowWidth.substring(0, nowWidth.length - 2) * 1
      if (nowWidth === 0) {
        const duration = this.wavesurfer.getDuration()
        this.duration = duration.toFixed(2)
        const calcWidth = duration.toFixed(2) * 28
        this.containerWidth = calcWidth > 150 ? 150 : calcWidth
        this.wavesurfer.load(BASE_AUDIO_URL + this.url)
        this.$emit('ready')
        this.$forceUpdate()
      }
      // this.wavesurfer.play()
    })
    this.wavesurfer.on('error', err => {
      console.log(err)
    })
  },
  methods: {
    play () {
      this.wavesurfer.playPause()
    }
  }
}
</script>

<style lang="scss" scoped>
.waveformOuter {
  display: flex;
}
</style>