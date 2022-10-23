import { Signer } from "ethers";
import { ethers } from "hardhat";

export const deploy = async (owner: Signer) => {
  const SampleNFT = await ethers.getContractFactory("SampleNFT")
  const sampleNFT = await SampleNFT.connect(owner).deploy()
  await sampleNFT.deployed()

  const SampleERC721MultiSaleByMerkle = await ethers.getContractFactory("SampleERC721MultiSaleByMerkle")
  const sampleERC721MultiSaleByMerkle = await SampleERC721MultiSaleByMerkle.connect(owner).deploy(sampleNFT.address)
  await sampleERC721MultiSaleByMerkle.deployed()

  const SampleERC721MultiSaleBySignature = await ethers.getContractFactory("SampleERC721MultiSaleBySignature")
  const sampleERC721MultiSaleBySignature = await SampleERC721MultiSaleBySignature.connect(owner).deploy(sampleNFT.address)
  await sampleERC721MultiSaleBySignature.deployed()

  await sampleERC721MultiSaleBySignature.setSigner(owner.getAddress())

  await sampleNFT.grantRole(await sampleNFT.MINTER(), sampleERC721MultiSaleByMerkle.address)
  await sampleNFT.grantRole(await sampleNFT.MINTER(), sampleERC721MultiSaleBySignature.address)

  await sampleNFT.grantRole(await sampleNFT.BURNER(), sampleERC721MultiSaleByMerkle.address)
  await sampleNFT.grantRole(await sampleNFT.BURNER(), sampleERC721MultiSaleBySignature.address)

  return { sampleNFT, sampleERC721MultiSaleByMerkle, sampleERC721MultiSaleBySignature }
}

export default deploy