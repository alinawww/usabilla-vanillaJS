class App {
  constructor() {
    this.feedbackItems = []
    this.feedbackElements = []
    this.selectedRatings = []
    this.searchQuery = ''

    const searchInput = document.getElementById('feedback-search-query')
    searchInput.addEventListener('input', (ev) => {
      ev.preventDefault()
      this.searchQuery = searchInput.value
      this.filterList()
    })

    const ratingFilter = document.getElementById('feedback-rating-filter')

    ratingFilter.addEventListener('click', (ev) => {
      ev.preventDefault()
      const rating = ev.target.getAttribute('rating')
      if (rating !== null) {
        const ratingBtn = document.getElementById(`rating-${rating}`)
        if (!this.selectedRatings.includes(rating)) {
          ratingBtn.classList.add('selected')
          this.selectedRatings.push(rating)
        }
        else {
          ratingBtn.classList.remove('selected')
          this.selectedRatings.splice(this.selectedRatings.indexOf(rating), 1)
        }
        this.filterList()
      }
    })
  }

  init () {
    this.showFeedbackItems()
  }

  async showFeedbackItems() {
    this.feedbackItems = await fetch('https://static.usabilla.com/recruitment/apidemo.json')
    .then(results => results.json())
    .then(jsonData => {
      if (!jsonData.items) return []
      return jsonData.items.map(item => {
        const {id, rating, comment, computed_browser} = item
        return {
          id,
          rating,
          comment,
          browser: {
            name: computed_browser.Browser,
            version: computed_browser.Version
          },
          platform: computed_browser.Platform
        }
      })
    })
    .catch(error => console.error('Error:', error))
    this.render()
  }

  createFeedbackItem({id, rating, comment, browser, platform}, isHidden=false) {
    let feedbackEl = document.createElement('div')
    feedbackEl.id = id
    feedbackEl.className = isHidden ? 'hidden' : ''
    feedbackEl.innerHTML = `
    <div class="item">
      <div class="item__col item__col--rating">
        <div class="rating">${rating}</div>
      </div>
      <div class="item__col item__col--comment">
        ${comment}
      </div>
      <div class="item__col item__col--browser">
        ${browser.name} <br/> ${browser.version}
      </div>
      <div class="item__col item__col--device">
        Desktop
      </div>
      <div class="item__col item__col--platform">
        ${platform}
      </div>
    </div>
    `
    this.feedbackElements.push(feedbackEl);
    return feedbackEl
  }

  filterList() {
    const hiddenItemsIds = []
    this.feedbackItems.map(item => {
      if (this.selectedRatings.length) {
        if (!this.selectedRatings.includes(item.rating.toString()) || !item.comment.toLowerCase().includes(this.searchQuery)) {
          hiddenItemsIds.push(item.id)
        }
      }
      else if (!item.comment.toLowerCase().includes(this.searchQuery)) {
        hiddenItemsIds.push(item.id)
      }
    })

    this.feedbackElements.map(item => {
      if (hiddenItemsIds.includes(item.id)) {
        item.style.display = 'none'
      }
      else {
        item.style.display = 'block'
      }
    })
  }

  render () {
    const el = document.getElementById('app')
    const fragment = document.createDocumentFragment()

    this.feedbackItems.map(item => {
      fragment.appendChild(this.createFeedbackItem(item))
    })

    el.appendChild(fragment)
  }
}

let app = new App()
app.init()
