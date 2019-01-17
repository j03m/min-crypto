

const state1 =["Slope-Long - up", "Slope - Long - down", "Slope - Long - flat"]
const state2 =["Slope-Short - up", "Slope - Short - down", "Slope - Short - flat"]
const state3 =["Band-Low", "Band-High"]


for (let i =0; i<3; i++){
  for (let ii =0; ii<3; ii++){
    for (let iii =0; iii<2; iii++){
      console.log(`${state1[i]} ${state2[ii]} ${state3[iii]}`)
    }
  }
}