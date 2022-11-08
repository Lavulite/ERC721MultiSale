import { Signer } from "ethers";
import { ethers } from "hardhat";

export const deploy = async (owner: Signer) => {
  const SampleNFT = await ethers.getContractFactory("SampleNFT")
  const sampleNFT = await SampleNFT.connect(owner).deploy()
  await sampleNFT.deployed()

  const SampleERC721MultiSaleByMerkle = await ethers.getContractFactory("SampleERC721MultiSaleByMerkle")
  const sampleERC721MultiSaleByMerkle = await SampleERC721MultiSaleByMerkle.connect(owner).deploy(sampleNFT.address)
  await sampleERC721MultiSaleByMerkle.deployed()
  await sampleERC721MultiSaleByMerkle.setMaxSupply(100)
  
  const SampleERC721MultiSaleBySignature = await ethers.getContractFactory("SampleERC721MultiSaleBySignature")
  const sampleERC721MultiSaleBySignature = await SampleERC721MultiSaleBySignature.connect(owner).deploy(sampleNFT.address)
  await sampleERC721MultiSaleBySignature.deployed()
  await sampleERC721MultiSaleBySignature.setMaxSupply(100)
  await sampleERC721MultiSaleBySignature.setSigner(owner.getAddress())

  const SampleERC721MultiSaleByMerkleMultiWallet = await ethers.getContractFactory("SampleERC721MultiSaleByMerkleMultiWallet")
  const sampleERC721MultiSaleByMerkleMultiWallet = await SampleERC721MultiSaleByMerkleMultiWallet.connect(owner).deploy(sampleNFT.address)
  await sampleERC721MultiSaleByMerkleMultiWallet.deployed()
  await sampleERC721MultiSaleByMerkleMultiWallet.setMaxSupply(100)

  await sampleNFT.grantRole(await sampleNFT.MINTER(), sampleERC721MultiSaleByMerkle.address)
  await sampleNFT.grantRole(await sampleNFT.MINTER(), sampleERC721MultiSaleBySignature.address)
  await sampleNFT.grantRole(await sampleNFT.MINTER(), sampleERC721MultiSaleByMerkleMultiWallet.address)

  await sampleNFT.grantRole(await sampleNFT.BURNER(), sampleERC721MultiSaleByMerkle.address)
  await sampleNFT.grantRole(await sampleNFT.BURNER(), sampleERC721MultiSaleBySignature.address)
  await sampleNFT.grantRole(await sampleNFT.BURNER(), sampleERC721MultiSaleByMerkleMultiWallet.address)
  
  return { sampleNFT, sampleERC721MultiSaleByMerkle, sampleERC721MultiSaleBySignature, sampleERC721MultiSaleByMerkleMultiWallet }
}

export default deploy