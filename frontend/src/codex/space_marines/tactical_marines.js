import axios from "axios";
import { useEffect, useState } from "react";

function TacticalMarines() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    async function getData() {
      const res = await axios.get(`/api/codex/sm_tactical_marine`);
      const { sbps, ebps } = res.data;
      setData({ sbps, ebps })
    };

    getData();
  }, [])
  return <div>
    <h1>Tactical Marine Squad - Details</h1>
    <div>
      <UnitStats data={data} />
      <ModelStats data={data} unit_name={'Tactical Marine'} />
      <ModelStats data={data} unit_name={'Tactical Sergeant'} />
      <ModelEconomy data={data} unit_name={'Tactical Marine'} />
      <ModelEconomy data={data} unit_name={'Tactical Sergeant'} />
    </div>
  </div>
}

export default TacticalMarines;

function ModelStats({ data, unit_name }) {
  const hp = data ? data.ebps.leveling_ext.attrib_levels[1].attrib_level_attributes.health.health : undefined;
  const energy = data ? data.ebps.leveling_ext.attrib_levels[1].attrib_level_attributes.skills.energy : undefined;
  const unit_type = undefined

  const _ = data ? data.sbps.squad_loadout_ext.unit_list.map(unit => ({
    unit_entry: unit.squad_loadout_unit_entry,
  })) : undefined;

  return (
    <section className="card shadow-xl">
      <div className="card-body">
        <div className="card-title">Model stats - {unit_name}</div>
        <div className="grid gap-4 grid-cols-3 grid-rows-5">
          <div className="flex justify-space-between"><span>type</span><span>{unit_type}</span></div>
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

function UnitStats({ data }) {
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

function ModelEconomy({ data, unit_name }) {
  return (
    <section className="card shadow-xl">
      <div className="card-body">
        <div className="card-title">Economy - {unit_name}</div>
        <div className="grid gap-4 grid-cols-2 grid-rows-5">
          <span>produce</span>
          <span>reinforce</span>
          <span>produce</span>
          <span>reinforce</span>
          <span>produce</span>
          <span>reinforce</span>
          <span>produce</span>
          <span>reinforce</span>
          <span>produce</span>
          <span>upkeep</span>
        </div>
      </div>
    </section>
  )
}
