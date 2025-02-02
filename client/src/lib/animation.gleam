pub type Animation {
  PerpetualAnimation(elapsed: Float, cycle: Float)
  FixedAnimation(elapsed: Float, duration: Float)
}
