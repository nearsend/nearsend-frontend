import { Dispatch, SetStateAction, useState } from 'react';

export const useModal = (
  defaultState = false,
): {
  visible: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onToggleModal: () => void;
} => {
  const [visible, setVisible] = useState(defaultState);
  const onOpenModal = () => {
    setVisible(true);
  };
  const onCloseModal = () => {
    setVisible(false);
  };
  const onToggleModal = () => {
    setVisible((prevState) => !prevState);
  };
  return {
    visible,
    onOpenModal,
    onCloseModal,
    setVisible,
    onToggleModal,
  };
};
