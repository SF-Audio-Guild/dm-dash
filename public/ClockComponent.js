import createElement from './lib/createElement.js'
import msToTime from './lib/msToTime.js'

export default class ClockComponent {
  constructor (props) {
    this.domComponent = props.domComponent
    this.domComponent.className = 'clock-component'
    this.parentRender = props.parentRender
    this.id = props.id
    this.title = props.title
    ;(this.isRunning = false),
      (this.currentTimeInMilliseconds = props.currentTimeInMilliseconds)
    this.runClock = undefined
    this.runAutoSave = undefined
    this.edit = false
    this.runSpeed = 1
    this.render()
  }

  calculateNowAndRunspeed = () => {
    return Math.floor(Date.now() * this.runSpeed)
  }

  start = () => {
    if (!this.isRunning) {
      this.isRunning = true
      // get start time
      var startTime =
        this.calculateNowAndRunspeed() - this.currentTimeInMilliseconds
      // update clock
      this.runClock = setInterval(() => {
        var elapsedTime = this.calculateNowAndRunspeed() - startTime

        // reset if one day
        if (elapsedTime === 8640000) this.currentTimeInMilliseconds = 0

        var timeDif = elapsedTime - this.currentTimeInMilliseconds
        this.currentTimeInMilliseconds += timeDif
        this.renderDisplayTime()
      }, 100)
      // Auto Save
      this.runAutoSave = setInterval(() => {
        this.saveClock()
      }, 60 * 1000)
    }
  }

  stop = () => {
    clearInterval(this.runClock)
    this.isRunning = false
    this.saveClock()
  }

  reset = () => {
    this.currentTimeInMilliseconds = 0
  }

  editTitle = () => {
    this.title = document.getElementById(`edit-clock-title-${this.id}`).value
  }

  toggleEdit = () => {
    this.stop()
    this.edit = !this.edit
    this.render()
  }

  renderDisplayTime = () => {
    const currentTimeDiv = document.getElementById(`current-time-${this.id}`)

    var milliseconds = this.currentTimeInMilliseconds
    var time = msToTime(milliseconds)

    if (this.edit) {
      const timeInput = document.getElementById(`time-input-${this.id}`)
      timeInput.value = time.substring(0, time.length - 2)
      return
    }

    currentTimeDiv.innerHTML = time
  }

  saveClock = async () => {
    const res = await fetch(`http://localhost:4000/api/edit_clock/${this.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: this.title,
        current_time_in_milliseconds: this.currentTimeInMilliseconds
      })
    })
  }

  removeClock = async () => {
    const res = await fetch(
      `http://localhost:4000/api/remove_clock/${this.id}`,
      {
        method: 'DELETE'
      }
    )
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
      this.toggleEdit()
      this.parentRender()
    } else {
      window.alert('Failed to delete clock...')
    }
  }

  renderEditClock = () => {
    var milliseconds = this.currentTimeInMilliseconds
    var time = msToTime(milliseconds)
    var valueForInput = time.substring(0, time.length - 2)

    const titleInput = createElement('input', {
      id: `edit-clock-title-${this.id}`,
      value: this.title
    })

    const timeInput = createElement('input', {
      value: valueForInput,
      type: 'time'
    })
    timeInput.addEventListener(
      'change',
      e => (this.currentTimeInMilliseconds = e.target.valueAsNumber)
    )
    const editButton = createElement('button', {}, 'Done')
    editButton.addEventListener('click', async () => {
      this.editTitle()
      await this.saveClock()
      this.toggleEdit()
      this.parentRender()
    })
    const removeButton = createElement('button', {}, 'Remove')
    removeButton.addEventListener('click', () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        this.removeClock()
      }
    })
    const resetButton = createElement('button', {}, 'Reset')
    resetButton.addEventListener('click', async () => {
      if (window.confirm(`Are you sure you want to reset ${this.title}`)) {
        this.reset()
        await this.saveClock()
        this.toggleEdit()
        this.parentRender()
      }
    })
    // render
    this.domComponent.appendChild(titleInput)
    this.domComponent.appendChild(timeInput)
    timeInput.focus()
    this.domComponent.appendChild(editButton)
    this.domComponent.appendChild(removeButton)
    this.domComponent.appendChild(resetButton)
  }

  render = () => {
    // clear
    this.domComponent.innerHTML = ''
    // if edit clock
    if (this.edit) {
      this.renderEditClock()
      return
    }

    const titleDiv = createElement('div', { class: 'clock-title' }, this.title)
    const currentTimeDiv = createElement('div', {
      id: `current-time-${this.id}`
    })

    const startButton = createElement('button', {}, 'Start')
    startButton.addEventListener('click', this.start)

    const stopButton = createElement('button', {}, 'Stop')
    stopButton.addEventListener('click', this.stop)

    const editButton = createElement('button', {}, 'Edit')
    editButton.addEventListener('click', this.toggleEdit)

    const selectSpeed = createElement('select', { name: 'speed' }, [
      createElement('option', { value: 1 }, '--Speed Select--'),
      createElement('option', { value: 1 }, '1'),
      createElement('option', { value: 0.5 }, '1/2'),
      createElement('option', { value: 0.25 }, '1/4'),
      createElement('option', { value: 2 }, '2x'),
      createElement('option', { value: 4 }, '4x')
    ])
    selectSpeed.addEventListener('change', e => {
      this.stop()
      this.runSpeed = parseFloat(e.target.value)
    })

    // append
    const fragment = document.createDocumentFragment() // try fragment method
    fragment.append(
      titleDiv,
      currentTimeDiv,
      startButton,
      stopButton,
      editButton,
      selectSpeed
    )
    this.domComponent.appendChild(fragment)
    // Display time
    this.renderDisplayTime()
  }
}