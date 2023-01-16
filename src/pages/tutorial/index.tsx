import { Typography, Image } from 'antd';
import { Link } from 'react-router-dom';

import BackTopComponent from 'components/BackTop';

import Step1 from 'resources/images/tutorial/step1.png';
import Step1_1 from 'resources/images/tutorial/step1-1.png';
import Step2 from 'resources/images/tutorial/step2.png';
import Step3 from 'resources/images/tutorial/step3.png';
import Step4 from 'resources/images/tutorial/step4.png';
import Head from 'components/Layout/Head';

const { Title, Paragraph } = Typography;

const TutorialPage = () => {
  return (
    <>
      <Head
        title="How to Bulksend NEAR (NEP-141) Tokens | Nearsend"
        description="A quick guide on how to bulk send, multi-send or batch transact NEP-141 Tokens on Near Protocol by using Nearsend,"
      />
      <section className="tutorial-page" id="tutorial">
        <div className="container">
          <BackTopComponent />

          <Title level={1}>How to bulk send Near Protocol tokens ?</Title>
          <Paragraph className="sub-title">
            As the NEAR ecosystem grows, there’s a need for founders to seamlessly distribute NEAR and NEP-141 standard
            tokens in bulk and in a fast manner.Here’s a quick 4-step manual on how to do so by using{' '}
            <Link to="/">nearsend.io</Link>, a non-tech savvy tool for everyone to use.
          </Paragraph>

          <Title level={2}>Pre-requisites</Title>
          <Paragraph>To successfully batch send your NEAR or NEP-141 tokens, you will need : </Paragraph>
          <ul>
            <li>
              <strong>A web3 NEAR wallet</strong> : We recommend either the main{' '}
              <a href="https://wallet.near.org/" target="_blank" rel="noreferrer">
                Near Protocol wallet
              </a>{' '}
              , or a chrome extension wallet like{' '}
              <a href="https://senderwallet.io/" target="_blank" rel="noreferrer">
                SenderWallet
              </a>{' '}
              as NearSend supports these 2 at the time of writing.
            </li>
            <li>
              <strong>Some NEAR in your wallet</strong> : To enable transactions, you will need to pay 2 fees on
              Nearsend, the service fee and the storage fee. These 2 are small, ranging from 0.25 to 5 NEAR.
            </li>
            <li>
              <strong> A list of addresses and amounts</strong> : You can either prepare a list to copy-paste into
              NearSend, or upload a .csv file into the web app.
            </li>
          </ul>

          <Title level={2}>Step 1 – Prepare</Title>
          <Paragraph>
            Preparing your batch transaction is fairly simple. Head to <Link to="/">nearsend.io</Link> and connect your
            web3 wallet. As mentioned above, Nearsend currently supports the official Near Protocol wallet, and
            Senderwallet.
            <br />
            Once connected, select the token you wish to bulk send from the dropdown. Nearsend synchronises with your
            wallet and offers to transact with the tokens that figure in your wallet. The decimals will be automatically
            filled in by Nearsend.
          </Paragraph>
          <Image preview={false} height={361} src={Step1} alt="" />
          <Paragraph>
            Once you’ve selected which token to multi-transact, you can now fill in the recipients and amounts. You can
            directly copy and paste from an existing list or upload a .csv file.
            <br />
            The web-app is well thought out to avoid human error and currently supports the following formats, making
            Nearsend my app of choice when wanting to bulk-transact tohundreds of addresses :
            <ul>
              <li>Address,amount</li>
              <li>Address, amount</li>
              <li>Address , amount</li>
              <li>Address ,amount</li>
            </ul>
            The result should look something like this :
          </Paragraph>
          <Image preview={false} height={406} src={Step1_1} alt="" />
          <Paragraph>Once done, click ‘Next’. If there are any errors, Nearsend will notify you.</Paragraph>

          <Title level={2}>Step 2 – Setup Storage Deposit</Title>
          <Paragraph>
            In order to send a fungible token to an account, the receiver must have a storage deposit. This is needed
            because each smart contract on NEAR must account for storage used, and each account on a fungible token
            contract takes up a small amount of storage.
            <br />
            Nearsend does the job of highlighting those addresses for you and gives you the option to pay the storage
            fee in one transaction. Note that Nearsend has calculated the cost of the entire operation, would you pay
            the storage fees for all addresses.
            <br />
            If you are bulk-sending NEAR, you probably won’t see this step because generally all NEAR wallets have
            received NEAR in the past, unless the user freshly created that address.
            <br />
            If you know the owners of each address, you can also manually reach out to them to setup the storage deposit
            for them. You will see the following page, with setup accounts in green, and those that are yet to setup
            their account in red :
          </Paragraph>
          <Image preview={false} height={498} src={Step2} alt="" />
          <Paragraph>
            Click confirm and approve the transaction in your web3 wallet. You will be sent to the final step.
          </Paragraph>

          <Title level={2}>Step 3 – Confirm all transactions</Title>
          <Paragraph>
            Once approved, you will be directed to the confirmation page and will find a summary of your
            bulk-transaction. This is the last step for you to double-check if any errors exist.
            <br />
            You will find the total number of receiving addresses, the number of transactions needed, estimated gas
            fees, the total number of tokens to be sent out, your current token balance as well as your current NEAR
            balance.
          </Paragraph>
          <Image preview={false} height={418} src={Step3} alt="" />

          <Title level={2}>Step 4 – Wait until finished</Title>
          <Paragraph>
            Now you can simply wait until all transactions are successfully completed. Once the last transaction is sent
            you will be able to download a report of the whole operation.
          </Paragraph>
          <Image preview={false} height={363} src={Step4} alt="" />
          <Paragraph>
            If some transactions are not sent out, Nearsend will notify you and give you the opportunity to “retry”.
          </Paragraph>
        </div>
      </section>
    </>
  );
};

export default TutorialPage;
