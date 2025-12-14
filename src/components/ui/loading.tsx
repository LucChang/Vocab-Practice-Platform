'use client'; 

import { useDisclosure } from '@mantine/hooks';
import { LoadingOverlay, Button, Group, Box } from '@mantine/core';

// 使用 'export' 關鍵字進行具名導出
export function LoadingOverlayDemo() {
  const [visible, { toggle }] = useDisclosure(false);

  return (
    // ... 組件的 JSX ...
    <Group justify="center" mt="md">
        <Button onClick={toggle}>
          {visible ? '隱藏載入畫面' : '顯示載入畫面'}
        </Button>
    </Group>
  );
}

// 注意：如果使用具名導出，文件末尾就不需要 'export default LoadingOverlayDemo;' 了