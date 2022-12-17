import { Signer } from "ethers"
import { ethers } from "hardhat"

const sign = async (saleId: number, address: string, allowedAmount: number, signer: Signer) => {
  return await signer.signMessage(
    ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(
        [
          "uint8",
          "address",
          "uint248"
        ],
        [
          saleId,
          address,
          allowedAmount
        ]
      )
    )
  )
}

export default sign