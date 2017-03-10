import React from 'react'

import { SUI } from 'src/lib'
import Transition from 'src/modules/Transition/Transition'
import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

let wrapper

const wrapperMount = (...args) => (wrapper = mount(...args))
const wrapperShallow = (...args) => (wrapper = shallow(...args))

describe('Transition', () => {
  common.hasSubComponents(Transition, [TransitionGroup])
  common.hasValidTypings(Transition)

  beforeEach(() => {
    wrapper = undefined
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
  })

  describe('animation', () => {
    SUI.ENTIRE_TRANSITIONS.forEach(animation => {
      it(`entire ${animation}`, () => {
        wrapperShallow(
          <Transition animation={animation} transitionAppear={false}>
            <p />
          </Transition>
        )

        wrapper.setState({ status: Transition.ENTERING })
        wrapper.should.have.className(animation)
        wrapper.should.have.className('in')

        wrapper.setState({ status: Transition.EXITING })
        wrapper.should.have.className(animation)
        wrapper.should.have.className('out')
      })
    })

    SUI.STATIC_TRANSITIONS.forEach(animation => {
      it(`static ${animation}`, () => {
        wrapperShallow(
          <Transition animation={animation} transitionAppear={false}>
            <p />
          </Transition>
        )

        wrapper.setState({ status: Transition.ENTERING })
        wrapper.should.have.className(animation)
        wrapper.should.not.have.className('in')

        wrapper.setState({ status: Transition.EXITING })
        wrapper.should.have.className(animation)
        wrapper.should.not.have.className('out')
      })
    })
  })

  describe('className', () => {
    it("passes element's className", () => {
      wrapperShallow(
        <Transition>
          <p className='foo bar' />
        </Transition>
      )

      wrapper.should.have.className('foo')
      wrapper.should.have.className('bar')
    })

    it('adds classes when ENTERED', () => {
      wrapperShallow(<Transition transitionAppear={false}><p /></Transition>)

      wrapper.should.have.className('visible')
      wrapper.should.have.className('transition')
    })

    it('adds classes when ENTERING', () => {
      wrapperShallow(<Transition transitionAppear={false}><p /></Transition>)
      wrapper.setState({ animating: true, status: Transition.ENTERING })

      wrapper.should.have.className('animating')
      wrapper.should.have.className('visible')
      wrapper.should.have.className('transition')
    })

    it('adds classes when EXITED', () => {
      wrapperShallow(<Transition><p /></Transition>)
      wrapper.setState({ status: Transition.EXITED })

      wrapper.should.have.className('hidden')
      wrapper.should.have.className('transition')
    })

    it('adds classes when EXITING', () => {
      wrapperShallow(<Transition transitionAppear={false}><p /></Transition>)
      wrapper.setState({ animating: true, status: Transition.EXITING })

      wrapper.should.have.className('animating')
      wrapper.should.have.className('visible')
      wrapper.should.have.className('transition')
    })
  })

  describe('children', () => {
    it('clones element', () => {
      wrapperShallow(
        <Transition>
          <p className='foo' />
        </Transition>
      ).should.have.descendants('p.foo')
    })

    it('returns null when UNMOUNTED', () => {
      wrapperShallow(
        <Transition>
          <p className='foo bar' />
        </Transition>
      )

      wrapper.setState({ status: Transition.UNMOUNTED })
      wrapper.should.be.blank()
    })
  })

  describe('constructor', () => {
    it('has default statuses', () => {
      wrapperShallow(<Transition><p /></Transition>)

      wrapper.should.have.state('status', Transition.ENTERED)
      wrapper.instance().should.include({ nextStatus: undefined })
    })

    it('sets statuses when `into` is false', () => {
      wrapperShallow(<Transition into={false}><p /></Transition>)

      wrapper.should.have.state('status', Transition.UNMOUNTED)
      wrapper.instance().should.include({ nextStatus: undefined })
    })

    it('sets statuses when mount is disabled', () => {
      wrapperShallow(
        <Transition
          into={false}
          mountOnEnter={false}
          unmountOnExit={false}
        >
          <p />
        </Transition>
      )

      wrapper.should.have.state('status', Transition.EXITED)
      wrapper.instance().should.include({ nextStatus: undefined })
    })
  })

  describe('duration', () => {
    it('applies default value to style', () => {
      wrapperShallow(
        <Transition>
          <p />
        </Transition>
      ).should.have.style('animation-duration', '500ms')
    })

    it('applies value to style', () => {
      wrapperShallow(
        <Transition duration={1000}>
          <p />
        </Transition>
      ).should.have.style('animation-duration', '1000ms')
    })
  })

  describe('into', () => {
    it('updates status when set to false while ENTERING', () => {
      wrapperShallow(<Transition transitionAppear={false}><p /></Transition>)
      wrapper.setState({ status: Transition.ENTERING })
      wrapper.setProps({ into: false })

      wrapper.instance().should.include({ nextStatus: Transition.EXITING })
    })

    it('updates status when set to false while ENTERED', () => {
      wrapperShallow(
        <Transition transitionAppear={false}>
          <p />
        </Transition>
      )
      wrapper.setProps({ into: false })

      wrapper.instance().should.include({ nextStatus: Transition.EXITING })
    })

    it('updates status when set to true while UNMOUNTED', () => {
      wrapperShallow(
        <Transition
          into={false}
          mountOnEnter
          unmountOnExit
        >
          <p />
        </Transition>
      )
      wrapper.setProps({ into: true })

      wrapper.should.have.state('status', Transition.EXITED)
      wrapper.instance().should.include({ nextStatus: Transition.ENTERING })
    })
  })

  describe('onComplete', () => {
    it('is called with (null, props) when transition completed', done => {
      const onComplete = sandbox.spy()
      const handleComplete = (...args) => {
        onComplete(...args)

        onComplete.should.have.been.calledOnce()
        onComplete.should.have.been.calledWithMatch(null, { duration: 0, status: Transition.ENTERING })

        done()
      }

      wrapperMount(
        <Transition
          duration={0}
          onComplete={handleComplete}
          transitionAppear
        >
          <p />
        </Transition>
      )
    })
  })

  describe('onHide', () => {
    it('is called with (null, props) when hidden', done => {
      const onHide = sandbox.spy()
      const handleHide = (...args) => {
        onHide(...args)

        onHide.should.have.been.calledOnce()
        onHide.should.have.been.calledWithMatch(null, { duration: 0, status: Transition.EXITED })

        done()
      }

      wrapperMount(
        <Transition
          duration={0}
          onHide={handleHide}
          transitionAppear={false}
        >
          <p />
        </Transition>
      )
      wrapper.setProps({ into: false })
    })
  })

  describe('onShow', () => {
    it('is called with (null, props) when shown', done => {
      const onShow = sandbox.spy()
      const handleShow = (...args) => {
        onShow(...args)

        onShow.should.have.been.calledOnce()
        onShow.should.have.been.calledWithMatch(null, { duration: 0, status: Transition.ENTERED })

        done()
      }

      wrapperMount(
        <Transition
          duration={0}
          onShow={handleShow}
          transitionAppear
        >
          <p />
        </Transition>
      )
    })
  })

  describe('onStart', () => {
    it('is called with (null, props) when transition started', done => {
      const onStart = sandbox.spy()
      const handleStart = (...args) => {
        onStart(...args)

        onStart.should.have.been.calledOnce()
        onStart.should.have.been.calledWithMatch(null, { duration: 0, status: Transition.ENTERING })

        done()
      }

      wrapperMount(
        <Transition
          duration={0}
          onStart={handleStart}
          transitionAppear
        >
          <p />
        </Transition>
      )
    })
  })

  describe('style', () => {
    it("passes element's style", () => {
      wrapperShallow(
        <Transition>
          <p style={{ bottom: 5, top: 10 }} />
        </Transition>
      )

      wrapper.should.have.style('bottom', '5px')
      wrapper.should.have.style('top', '10px')
    })
  })

  describe('transitionAppear', () => {
    it('sets statuses when is true', () => {
      wrapperShallow(
        <Transition transitionAppear>
          <p />
        </Transition>
      )

      wrapper.should.have.state('status', Transition.EXITED)
      wrapper.instance().should.include({ nextStatus: Transition.ENTERING })
    })

    it('updates status after mount when is true', () => {
      wrapperMount(
        <Transition transitionAppear>
          <p />
        </Transition>
      ).should.have.state('status', Transition.ENTERING)
    })
  })

  describe('unmountOnExit', () => {
    it('unmounts child when true', done => {
      const onHide = () => {
        wrapper.should.have.state('status', Transition.UNMOUNTED)
        done()
      }

      wrapperMount(
        <Transition
          duration={0}
          onHide={onHide}
          transitionAppear={false}
          unmountOnExit
        >
          <p />
        </Transition>
      )
      wrapper.setProps({ into: false })
    })

    it('lefts mounted when false', done => {
      const onHide = () => {
        wrapper.should.have.state('status', Transition.EXITED)
        done()
      }

      wrapperMount(
        <Transition
          duration={5}
          onHide={onHide}
          transitionAppear={false}
          unmountOnExit={false}
        >
          <p />
        </Transition>
      )
      wrapper.setProps({ into: false })
    })
  })
})
