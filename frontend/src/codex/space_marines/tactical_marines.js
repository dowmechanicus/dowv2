function TacticalMarines() {
  return <div>
    <h1>Tactical Marine Squad - Details</h1>
    <UnitStats />
    <ModelStats unit_name={'Tactical Marine'} />
    <ModelStats unit_name={'Tactical Sergeant'} />
    <section></section>
  </div>
}

export default TacticalMarines;

function ModelStats({ unit_name }) {
  return (
    <section className="card shadow-xl">
      <div className="card-body">
        <div className="cart-title">Model stats - {unit_name}</div>
        <div className="grid gap-4 grid-cols-3 grid-rows-5">
          <span>type</span>
          <span>health</span>
          <span>charge speed</span>
          <span>armor</span>
          <span>melee skill</span>
          <span>charge range</span>
          <span>size</span>
          <span>speed</span>
          <span>charge duration</span>
          <span>xp</span>
          <span>rotation</span>
          <span>charge cooldown</span>
          <span>global</span>
          <span>sight</span>
          <span>leap</span>
        </div>
      </div>
    </section>
  )
}

function UnitStats() {
  return (
    <section className="card shadow-xl">
      <div className="card-body">
        <div className="card-title">Unit stats</div>
        <div className="grid gap-4 grid-cols-3 grid-rows-2">
          <span>type</span>
          <span>health</span>
          <span>courage</span>
          <span>squad</span>
          <span>energy</span>
        </div>
      </div>
    </section>
  )
}
