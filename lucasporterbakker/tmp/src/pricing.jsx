const React = require('react')

module.exports = class Page extends React.Component {
    constructor(props) {
        super(props)
        console.log(props)
    }

    checkout(id) {
        this.props.setState({state: 'checkout', select: id})
    }

    render() {
        const alert = err => <p class="alert-danger alert">Should config at least one pricing plan at
            backend: {JSON.stringify(err)}</p>
        try {
            const {plans: {list: planList}} = this.props.state
            if (!planList) {return alert()}

            let planHtml = planList.map((price, id) => (
                <li class="cards__item">
                  <div class="card">
                    <div class="card__image card__image--fence">
                    </div>
                    <div class="card__content">
                      <div class="card__title plan-details">{price.name}
                      </div>
                      <p class="card__text">{price.subhead}</p>
                      <section class="card-body">
                      <h1 class="type-desc">per {price.interval} {price.timeUnit}</h1>

                      <dl class="benefits">
                      <dt>{price.benefitsTitle}</dt>
                      {price.benefitsList.map(benefit => <dd>{benefit}</dd>)}</dl>
                      <div class="price-font">
                        ￥{price.price}
                      </div>
                      <button class="btn btn--block card__btn" onClick={() => this.checkout(id)}>
                      Get started
                      </button>
                      </section>
                    </div>
                  </div>
                </li>

              ))


            return (
                <div class="container">
                      <ul class="cards">
                        {planHtml}
                      </ul>
                    {/*<div id="warning"></div>*/}
                </div>
            )
        } catch (e) {
            return alert(e)
        }
    }
}
