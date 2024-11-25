import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  
  // 获取合约实例
  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.attach("你的合约地址");
  
  // 创建测试拍卖
  await auction.createAuction(
    "0xNFTAddress",
    1, // tokenId
    ethers.utils.parseEther("1"), // 起拍价
    3600 // 持续时间（秒）
  );
  
  console.log("测试拍卖已创建");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 